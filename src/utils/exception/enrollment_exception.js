export class EnrollmentException extends Error {
    constructor({ type, code, message }) {
        super(message)

        this.name = 'EnrollmentException'
        this.type = type
        this.code = code
    }

    static alreadyExists() {
        return new EnrollmentException({
            type: 'conflict',
            code: 'ENROLLMENT_ALREADY_EXISTS',
            message: 'You already enrolled in this course.',
        })
    }

    static courseNotFound() {
        return new EnrollmentException({
            type: 'notFound',
            code: 'COURSE_NOT_FOUND',
            message: 'Course not found.',
        })
    }

    static courseInactive() {
        return new EnrollmentException({
            type: 'validation',
            code: 'COURSE_INACTIVE',
            message: 'This course is currently inactive.',
        })
    }

    static unauthorized() {
        return new EnrollmentException({
            type: 'unauthorized',
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to perform this action.',
        })
    }

    static invalidStatusTransition() {
        return new EnrollmentException({
            type: 'validation',
            code: 'INVALID_STATUS_TRANSITION',
            message: 'Invalid enrollment status transition.',
        })
    }
}