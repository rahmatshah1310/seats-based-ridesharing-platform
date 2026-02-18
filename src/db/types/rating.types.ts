import type { ratingScoreEnum } from "../schema/enums";


export interface CreateRatingInput{
    rateeId:string;
    raterId:string;
    rideId:string;
    score:number,
    feedbackTags?:string[];
    comment?:string;
}
