export type LoginResponseType = {
    error: boolean,
    accessToken?: string,
    refreshToken?: string,
    fullName?: string,
    email?: string,
    userId?: number,
    message: string
}
