/**
 * @description In-memory fallback database engine for AegisSentinel SOC Platform.
 *              Allows the entire application to perform dynamic CRUD operations, register, login,
 *              and filter incidents in Chrome without a running MongoDB process.
 * @author Antigravity
 * @date 2026-05-22
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In-Memory Data Repositories
const dbStore = {
    User: [],
    Incident: [],
    ThreatLog: [],
    Analyst: []
};

// Fake Query implementation for supporting chainable Mongoose queries
class FakeQuery {
    constructor(data) {
        this.data = data;
    }

    select(fields) {
        if (!this.data) return this;
        
        const excludePassword = fields && fields.includes('-password');
        
        const sanitize = (item) => {
            if (!item) return item;
            const copy = { ...item };
            if (excludePassword) {
                delete copy.password;
            }
            return copy;
        };

        if (Array.isArray(this.data)) {
            this.data = this.data.map(sanitize);
        } else {
            this.data = sanitize(this.data);
        }
        return this;
    }

    sort(options) {
        if (!Array.isArray(this.data)) return this;
        
        if (options && options.createdAt) {
            const dir = options.createdAt; // -1 for desc, 1 for asc
            this.data = [...this.data].sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dir === -1 ? dateB - dateA : dateA - dateB;
            });
        }
        return this;
    }

    skip(n) {
        if (Array.isArray(this.data)) {
            this.data = this.data.slice(parseInt(n) || 0);
        }
        return this;
    }

    limit(n) {
        if (Array.isArray(this.data)) {
            this.data = this.data.slice(0, parseInt(n) || 10);
        }
        return this;
    }

    populate(path, select) {
        if (!this.data) return this;
        
        // Populates linkedIncident from the Incident store in memory
        if (path === 'linkedIncident') {
            const IncidentStore = dbStore['Incident'];
            const populateItem = (item) => {
                if (item && item.linkedIncident) {
                    const incidentId = item.linkedIncident.toString();
                    const matchedIncident = IncidentStore.find(inc => inc._id.toString() === incidentId);
                    if (matchedIncident) {
                        item.linkedIncident = {
                            _id: matchedIncident._id,
                            incidentName: matchedIncident.incidentName,
                            severity: matchedIncident.severity,
                            status: matchedIncident.status
                        };
                    }
                }
                return item;
            };

            if (Array.isArray(this.data)) {
                this.data = this.data.map(populateItem);
            } else {
                this.data = populateItem(this.data);
            }
        }
        return this;
    }

    // Supporting async/await chaining
    then(onFulfilled, onRejected) {
        return Promise.resolve(this.data).then(onFulfilled, onRejected);
    }
}

// Matches MongoDB queries in memory
function matchesQuery(item, query) {
    if (!query) return true;
    for (const key in query) {
        if (key === '$or') {
            const conditions = query.$or;
            if (!Array.isArray(conditions)) continue;
            const matched = conditions.some(cond => {
                for (const subKey in cond) {
                    const itemVal = String(item[subKey] || '');
                    const rule = cond[subKey];
                    if (rule && typeof rule === 'object' && rule.$regex) {
                        const regex = new RegExp(rule.$regex, rule.$options || '');
                        if (regex.test(itemVal)) return true;
                    } else {
                        if (itemVal.toLowerCase() === String(rule).toLowerCase()) return true;
                    }
                }
                return false;
            });
            if (!matched) return false;
        } else {
            const rule = query[key];
            const itemVal = item[key];
            if (rule && typeof rule === 'object' && rule.$regex) {
                const regex = new RegExp(rule.$regex, rule.$options || '');
                if (!regex.test(String(itemVal || ''))) return false;
            } else if (itemVal !== rule) {
                // If it's a mongoose object id check
                if (itemVal && itemVal.toString && rule && rule.toString && itemVal.toString() === rule.toString()) {
                    continue;
                }
                return false;
            }
        }
    }
    return true;
}

/**
 * Patches a Mongoose model to bypass database connections and perform calculations purely in memory.
 */
function patchModelForInMemory(modelName) {
    const Model = mongoose.model(modelName);
    const store = dbStore[modelName];

    console.log(`🔌 [In-Memory Patch] Intercepting queries for Mongoose Model: "${modelName}"`);

    // Override static methods
    Model.find = function(query) {
        const results = store.filter(item => matchesQuery(item, query));
        return new FakeQuery(results);
    };

    Model.findOne = function(query) {
        const item = store.find(i => matchesQuery(i, query));
        if (item) {
            // Attach password verification for User
            if (modelName === 'User') {
                item.comparePassword = async function(candidatePassword) {
                    return await bcrypt.compare(candidatePassword, item.password || '');
                };
            }
            return new FakeQuery(item);
        }
        return new FakeQuery(null);
    };

    Model.findById = function(id) {
        const item = store.find(i => String(i._id) === String(id));
        return new FakeQuery(item);
    };

    Model.countDocuments = async function(query) {
        const results = store.filter(item => matchesQuery(item, query));
        return results.length;
    };

    Model.create = async function(docData) {
        if (Array.isArray(docData)) {
            const results = [];
            for (const data of docData) {
                const doc = new Model(data);
                const saved = await doc.save();
                results.push(saved);
            }
            return results;
        } else {
            const doc = new Model(docData);
            return await doc.save();
        }
    };

    Model.insertMany = async function(docs) {
        const results = [];
        for (const data of docs) {
            const doc = new Model(data);
            const saved = await doc.save();
            results.push(saved);
        }
        return results;
    };

    Model.aggregate = async function(pipeline) {
        // Aggregates threat types and levels from store in memory for Recharts statistics
        if (modelName === 'ThreatLog') {
            const groupStage = pipeline.find(stage => stage.$group);
            if (groupStage) {
                const groupField = groupStage.$group._id;
                
                if (groupField === '$threatType') {
                    const counts = {};
                    store.forEach(item => {
                        const type = item.threatType || 'Malware Attack';
                        counts[type] = (counts[type] || 0) + 1;
                    });
                    return Object.keys(counts).map(key => ({
                        name: key,
                        value: counts[key]
                    }));
                }
                
                if (groupField === '$threatLevel') {
                    const counts = {};
                    store.forEach(item => {
                        const level = item.threatLevel || 'Low';
                        counts[level] = (counts[level] || 0) + 1;
                    });
                    return Object.keys(counts).map(key => ({
                        level: key,
                        count: counts[key]
                    }));
                }
            }
        }
        return [];
    };

    Model.findByIdAndDelete = async function(id) {
        const index = store.findIndex(i => String(i._id) === String(id));
        if (index >= 0) {
            const removed = store.splice(index, 1)[0];
            return removed;
        }
        return null;
    };

    Model.findByIdAndUpdate = async function(id, update, options) {
        const index = store.findIndex(i => String(i._id) === String(id));
        if (index >= 0) {
            const updatedDoc = { ...store[index], ...update, updatedAt: new Date() };
            store[index] = updatedDoc;
            return updatedDoc;
        }
        return null;
    };

    // Override instance prototype 'save' method
    Model.prototype.save = async function() {
        const doc = this;
        if (!doc._id) {
            doc._id = new mongoose.Types.ObjectId();
        }

        // Handle pre-save password hash for Users
        if (modelName === 'User' && doc.password && !doc.password.startsWith('$2a$')) {
            const salt = bcrypt.genSaltSync(10);
            doc.password = bcrypt.hashSync(doc.password, salt);
        }

        const docObj = doc.toObject ? doc.toObject() : doc;
        docObj._id = doc._id;

        // Ensure date fields
        docObj.createdAt = docObj.createdAt || new Date();
        docObj.updatedAt = new Date();

        const index = store.findIndex(item => String(item._id) === String(doc._id));
        if (index >= 0) {
            store[index] = { ...store[index], ...docObj };
        } else {
            store.push(docObj);
        }

        // Attach dynamic instance method helpers
        doc.comparePassword = async function(candidatePassword) {
            return await bcrypt.compare(candidatePassword, doc.password || '');
        };

        return doc;
    };
}

/**
 * Entry point to patch all database schemas to run offline.
 */
function setupInMemoryDatabase() {
    try {
        patchModelForInMemory('User');
        patchModelForInMemory('Incident');
        patchModelForInMemory('ThreatLog');
        patchModelForInMemory('Analyst');
        console.log('⚡ [In-Memory Patch] AegisSentinel is fully running on a local mock engine!');
    } catch (err) {
        console.error('❌ [In-Memory Patch] Failed to apply Mongoose mocks:', err);
    }
}

module.exports = {
    setupInMemoryDatabase,
    dbStore
};
