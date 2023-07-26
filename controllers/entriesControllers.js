class EntriesControllers {
    constructor(model) {
        this.model = model;
    }

    createEntry(body) {
        return this.model.create(body);
    }

}

module.exports = EntriesControllers;