export enum EyeColour {
    BLUE = 'Blue',
    BROWN = 'Brown',
    GREEN = 'Green',
    HAZEL = 'Hazel'
}

export interface INType {
    surname: string;
    forename?: string;
    phone: string;
    nationality: string;
    weight: number,
    eyeColour: EyeColour;
    dateOfBirth: Date,
    accepted: boolean;
}
