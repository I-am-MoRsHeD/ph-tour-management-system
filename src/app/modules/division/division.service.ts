import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { divisionSearchableFields } from "./division.constant";
import { IDivision } from "./division.interface";
import { Division } from "./division.model";


const createDivision = async (payload: Partial<IDivision>) => {
    const existingDivision = await Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new AppError(400, "A division with this name already exists.");
    };

    // model a 1ta middleware/pre hook use kora hoise slug auto create howar jonno

    const division = await Division.create(payload);
    return division
};

const getAllDivisions = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Division.find(), query)

    const divisionsData = queryBuilder
        .search(divisionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        divisionsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta,
    };
};

const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ slug });
    return {
        data: division,
    }
};

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
    const existingDivision = await Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division not found.");
    };

    const duplicateDivision = await Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateDivision) {
        throw new AppError(400, "A division with this name already exists.");
    };

    // model a 1ta middleware/pre hook use kora hoise slug auto update howar jonno howar jonno

    const updateDivision = await Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (payload.thumbnail && existingDivision.thumbnail) {
        await deleteImageFromCloudinary(payload.thumbnail);
    };

    return updateDivision
}

const deleteDivision = async (id: string) => {
    await Division.findByIdAndDelete(id);
    return null;
};

export const DivisionServices = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
};