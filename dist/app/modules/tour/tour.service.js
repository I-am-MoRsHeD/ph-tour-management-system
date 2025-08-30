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
exports.TourServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const tour_constant_1 = require("./tour.constant");
const tour_model_1 = require("./tour.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const cloudinary_config_1 = require("../../config/cloudinary.config");
// tour api services
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }
    // model a 1ta middleware/pre hook use kora hoise slug auto create howar jonno
    const tour = yield tour_model_1.Tour.create(payload);
    return tour;
});
// const getAllToursOld = async (query: Record<string, string>) => {
//     const filter = query;
//     const searchTerm = query.searchTerm || "";
//     const sort = query.sort || "createdAt";
//     const fields = query?.fields?.split(",").join(" ") || "";
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit;
//     for (const field of excludedFields) {
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete filter[field];
//     }
//     const searchArray = {
//         $or: tourSearchableFields.map(field => ({
//             [field]: { $regex: searchTerm, $options: "i" }
//         }))
//     };
//     // pattern - 1
//     // const tours = await Tour.find(searchArray).find(filter).sort(sort).select(fields).skip(skip).limit(limit);
//     // pattern - 2
//     const searchTours = Tour.find(searchArray);
//     const filterTours = searchTours.find(filter);
//     const tours = await filterTours.sort(sort).select(fields).skip(skip).limit(limit);
//     const totalTours = await Tour.countDocuments();
//     const totalPage = Math.ceil(totalTours / limit);
//     const meta = {
//         page,
//         limit,
//         totalPage,
//         total: totalTours
//     }
//     return {
//         data: tours,
//         meta: meta
//     }
// };
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    const tours = yield queryBuilder
        .filter()
        .search(tour_constant_1.tourSearchableFields)
        .sort()
        .fields()
        .paginate();
    // .build(); eitao use kora jabhe,niche use kora hoise,tai use kora hoini r!
    // pattern-1 --> eitao use kora jabhe for meta
    // const meta = await queryBuilder.getMeta();
    // pattern-2
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new Error("Tour not found.");
    }
    // model a 1ta middleware/pre hook use kora hoise slug auto update howar jonno
    if (payload.images && ((_a = payload.images) === null || _a === void 0 ? void 0 : _a.length) > 0 && existingTour.images && ((_b = existingTour.images) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    }
    ;
    if (payload.deleteImages && ((_c = payload.deleteImages) === null || _c === void 0 ? void 0 : _c.length) > 0 && existingTour.images && ((_d = existingTour.images) === null || _d === void 0 ? void 0 : _d.length) > 0) {
        const restImages = (_e = existingTour.images) === null || _e === void 0 ? void 0 : _e.filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); });
        const updatedImages = (payload.images || [])
            .filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); })
            .filter(imageUrl => !(restImages === null || restImages === void 0 ? void 0 : restImages.includes(imageUrl)));
        payload.images = [...restImages, ...updatedImages];
    }
    ;
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true });
    // delete the images from cloudinary
    if (payload.deleteImages && ((_f = payload.deleteImages) === null || _f === void 0 ? void 0 : _f.length) > 0 && existingTour.images && ((_g = existingTour.images) === null || _g === void 0 ? void 0 : _g.length) > 0) {
        for (const file of payload.deleteImages) {
            yield (0, cloudinary_config_1.deleteImageFromCloudinary)(file);
        }
        ;
    }
    ;
    return updatedTour;
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.Tour.findByIdAndDelete(id);
});
// tour type apis
const createTourType = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findOne({ name: payload.name });
    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }
    return yield tour_model_1.TourType.create(payload);
});
const getAllTourTypes = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // return await TourType.find();
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.TourType.find(), query);
    const tourTypes = yield queryBuilder
        .search(tour_constant_1.tourTypeSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        tourTypes.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const updateTourType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    ;
    const duplicateTourType = yield tour_model_1.TourType.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateTourType) {
        throw new AppError_1.default(400, "A tour type with this name already exists.");
    }
    ;
    const updatedTourType = yield tour_model_1.TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
});
const deleteTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    ;
    return yield tour_model_1.TourType.findByIdAndDelete(id);
});
exports.TourServices = {
    createTour,
    createTourType,
    getAllTourTypes,
    updateTourType,
    deleteTourType,
    getAllTours,
    updateTour,
    deleteTour,
};
