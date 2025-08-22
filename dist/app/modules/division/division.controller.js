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
exports.DivisionControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const division_service_1 = require("./division.service");
const sendResponse_1 = require("../../utils/sendResponse");
const createDivision = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { thumbnail: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const division = yield division_service_1.DivisionServices.createDivision(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Division created successfully",
        data: division
    });
}));
const getAllDivisions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield division_service_1.DivisionServices.getAllDivisions();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Divisions retrieved successfully!",
        data: result.data,
        meta: result.meta,
    });
}));
const getSingleDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const result = yield division_service_1.DivisionServices.getSingleDivision(slug);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division retrieved successfully",
        data: result.data,
    });
}));
const updateDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield division_service_1.DivisionServices.updateDivision(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division is updated successfully",
        data: result,
    });
}));
const deleteDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield division_service_1.DivisionServices.deleteDivision(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division is deleted successfully!",
        data: result,
    });
}));
exports.DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
};
