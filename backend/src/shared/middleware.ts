import * as yup from 'yup';
import { Request, Response, NextFunction } from 'express';

export const validate = (
    location: 'query' | 'body' | 'params',
    schema: yup.ObjectSchema<any>
  ) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        type RequestLocation = 'query' | 'body' | 'params';
  
        let _location: RequestLocation;
  
        switch (location) {
          case 'query':
            _location = 'query';
            break;
          case 'body':
            _location = 'body';
            break;
          case 'params':
            _location = 'params';
            break;
          default:
            throw new Error(`Invalid location: ${location}`);
        }
  
        req[_location] = await schema.validate(req[_location], {
          abortEarly: false,
        });
  
        next();
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          const errorMessages = error.errors.join(', ');
          return res.status(400).json({ error: errorMessages });
        }
        if (error instanceof Error) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(400).json({ error: 'An unknown error occurred' });
      }
    };
  };