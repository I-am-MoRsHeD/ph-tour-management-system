import AppError from "../../errorHelpers/AppError";
import { tourSearchableFields, tourTypeSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

// tour api services
const createTour = async (payload: ITour) => {
    const existingTour = await Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }

    // model a 1ta middleware/pre hook use kora hoise slug auto create howar jonno

    const tour = await Tour.create(payload)

    return tour;
};

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

const getAllTours = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Tour.find(), query);
    const tours = await queryBuilder
        .filter()
        .search(tourSearchableFields)
        .sort()
        .fields()
        .paginate()
    // .build(); eitao use kora jabhe,niche use kora hoise,tai use kora hoini r!

    // pattern-1 --> eitao use kora jabhe for meta
    // const meta = await queryBuilder.getMeta();

    // pattern-2
    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};


const updateTour = async (id: string, payload: Partial<ITour>) => {

    const existingTour = await Tour.findById(id);

    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    // model a 1ta middleware/pre hook use kora hoise slug auto update howar jonno

    if (payload.images && payload.images?.length > 0 && existingTour.images && existingTour.images?.length > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    };

    if (payload.deleteImages && payload.deleteImages?.length > 0 && existingTour.images && existingTour.images?.length > 0) {

        const restImages = existingTour.images?.filter(imageUrl => !payload.deleteImages?.includes(imageUrl));

        const updatedImages = (payload.images || [])
            .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
            .filter(imageUrl => !restImages?.includes(imageUrl));

        payload.images = [...restImages, ...updatedImages];
    };

    const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

    // delete the images from cloudinary
    if (payload.deleteImages && payload.deleteImages?.length > 0 && existingTour.images && existingTour.images?.length > 0) {
        for (const file of payload.deleteImages) {
            await deleteImageFromCloudinary(file);
        };
    };

    return updatedTour;
};

const deleteTour = async (id: string) => {
    return await Tour.findByIdAndDelete(id);
};

// tour type apis
const createTourType = async (payload: ITourType) => {
    const existingTourType = await TourType.findOne({ name: payload.name });

    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }

    return await TourType.create(payload);
};
const getAllTourTypes = async (query: Record<string, string>) => {
    // return await TourType.find();
    const queryBuilder = new QueryBuilder(TourType.find(), query)

    const tourTypes = await queryBuilder
        .search(tourTypeSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        tourTypes.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    };

    const duplicateTourType = await TourType.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateTourType) {
        throw new AppError(400, "A tour type with this name already exists.");
    };

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
};
const deleteTourType = async (id: string) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    };

    return await TourType.findByIdAndDelete(id);
};

export const TourServices = {
    createTour,
    createTourType,
    getAllTourTypes,
    updateTourType,
    deleteTourType,
    getAllTours,
    updateTour,
    deleteTour,
}
