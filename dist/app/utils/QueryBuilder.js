"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const constant_1 = require("../constant");
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    filter() {
        const filter = Object.assign({}, this.query); // eibhabe newar reason hocce query er ekta copy ready kore fela,,,
        for (const field of constant_1.excludedFields) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete filter[field];
        }
        ;
        this.modelQuery = this.modelQuery.find(filter); // this.modelquery = Tour.find();
        return this;
    }
    search(searchAbleFields) {
        const searchTerm = this.query.searchTerm || "";
        const searchQuery = {
            $or: searchAbleFields.map(field => ({
                [field]: { $regex: searchTerm, $options: "i" }
            }))
        };
        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }
    sort() {
        const sort = this.query.sort || "createdAt";
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    fields() {
        var _a, _b;
        const fields = ((_b = (_a = this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(",").join(" ")) || "";
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.modelQuery;
    }
    getMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 10;
            const totalDocuments = yield this.modelQuery.model.countDocuments();
            const totalPage = Math.ceil(totalDocuments / limit);
            return { page, limit, totalPage, total: totalDocuments };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
