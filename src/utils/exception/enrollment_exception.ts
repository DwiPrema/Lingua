
export type EnrollmentExceptionType =
    | 'conflict'
    | 'notFound'
    | 'validation'
    | 'unauthorized'

export type EnrollmentExceptionCode =
    | 'ENROLLMENT_ALREADY_EXISTS'
    | 'COURSE_NOT_FOUND'
    | 'COURSE_INACTIVE'
    | 'UNAUTHORIZED'
    | 'INVALID_STATUS_TRANSITION'

type EnrollmentExceptionInput = {
    type: EnrollmentExceptionType
    code: EnrollmentExceptionCode
    message: string
}

export class EnrollmentException extends Error {
    readonly type: EnrollmentExceptionType
    readonly code: EnrollmentExceptionCode

    constructor({ type, code, message }: EnrollmentExceptionInput) {
        super(message)

        this.name = 'EnrollmentException'
        this.type = type
        this.code = code

        Object.setPrototypeOf(this, EnrollmentException.prototype)
    }

    static alreadyExists(): EnrollmentException {
        return new EnrollmentException({
            type: 'conflict',
            code: 'ENROLLMENT_ALREADY_EXISTS',
            message: 'You already enrolled in this course.',
        })
    }

    static courseNotFound(): EnrollmentException {
        return new EnrollmentException({
            type: 'notFound',
            code: 'COURSE_NOT_FOUND',
            message: 'Course not found.',
        })
    }

    static courseInactive(): EnrollmentException {
        return new EnrollmentException({
            type: 'validation',
            code: 'COURSE_INACTIVE',
            message: 'This course is currently inactive.',
        })
    }

    static unauthorized(): EnrollmentException {
        return new EnrollmentException({
            type: 'unauthorized',
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to perform this action.',
        })
    }

    static invalidStatusTransition(): EnrollmentException {
        return new EnrollmentException({
            type: 'validation',
            code: 'INVALID_STATUS_TRANSITION',
            message: 'Invalid enrollment status transition.',
        })
    }
}
