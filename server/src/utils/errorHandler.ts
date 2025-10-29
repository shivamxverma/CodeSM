import httpStatus from 'http-status';
import ApiError from './apiError';
import logger from '../loaders/logger';

export interface DefaultResponse {
    success : boolean,
    message : string,
    data? : any
} 

export const handleDataNotFound = (
    entity : string,
    identifier : string,
    defaultData : any = null,
): DefaultResponse => {
    logger.warn(`${entity} not found for identifier: ${identifier}`);
    return {
        success : true,
        message : `${entity} not found`,
        data : defaultData
    };
}

export const handleExternalApiError = (
  service: string,
  operation: string,
  defaultData: any = null,
): DefaultResponse => {
  logger.error(`Error fetching data from ${service} for ${operation}`);
  return {
    success: true,
    message: `Unable to fetch ${operation} data at this time`,
    data: defaultData,
  };
};

export const handleDatabaseError = (
  operation: string,
  defaultData: any = null,
): DefaultResponse => {
  logger.error(`Database error during ${operation}`);
  return {
    success: true,
    message: `Unable to process ${operation} at this time`,
    data: defaultData,
  };
};


export const handleValidationError = (
  field: string,
  message: string,
): never => {
  throw new ApiError(httpStatus.BAD_REQUEST,`Invalid ${field}: ${message}`, false);
};

export const handleUnauthorizedError = (message: string): never => {
  throw new ApiError(httpStatus.UNAUTHORIZED,message,false);
};

export const handleForbiddenError = (message: string): never => {
  throw new ApiError(httpStatus.FORBIDDEN,message,false);
};

export const handleNotFoundError = (
  entity: string,
  identifier: string,
): never => {
  throw new ApiError(
    httpStatus.NOT_FOUND,
    `${entity} not found: ${identifier}`,
    false,
  );
};








