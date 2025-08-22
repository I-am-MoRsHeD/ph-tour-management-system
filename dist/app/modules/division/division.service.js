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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionServices = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const division_model_1 = require("./division.model");
const createDivision = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new AppError_1.default(400, "A division with this name already exists.");
    }
    ;
    // model a 1ta middleware/pre hook use kora hoise slug auto create howar jonno
    const division = yield division_model_1.Division.create(payload);
    return division;
});
const getAllDivisions = () => __awaiter(void 0, void 0, void 0, function* () {
    const divisions = yield division_model_1.Division.find({});
    const totalDivisions = yield division_model_1.Division.countDocuments();
    return {
        data: divisions,
        meta: {
            total: totalDivisions
        }
    };
});
const getSingleDivision = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const division = yield division_model_1.Division.findOne({ slug });
    return {
        data: division,
    };
});
const updateDivision = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division not found.");
    }
    ;
    const duplicateDivision = yield division_model_1.Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateDivision) {
        throw new AppError_1.default(400, "A division with this name already exists.");
    }
    ;
    // model a 1ta middleware/pre hook use kora hoise slug auto update howar jonno howar jonno
    const updateDivision = yield division_model_1.Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.thumbnail && existingDivision.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(payload.thumbnail);
    }
    ;
    return updateDivision;
});
const deleteDivision = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield division_model_1.Division.findByIdAndDelete(id);
    return null;
});
exports.DivisionServices = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
};
