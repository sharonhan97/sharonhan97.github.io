import { validationRequest,BadRequestError } from '@shanticket/common';
import express, { Request, Response } from 'express';
import {body} from 'express-validator'
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
    '/api/users/signup',
    //define validation rule
    [
        body('email')
            .isEmail()
            .withMessage("email must be valid"),
        body('password')
            .trim()
            .isLength({min:4,max:20})
            .withMessage('Password must be betweeen 4 and 20 chars')
    ],
    validationRequest,
    async (req: Request, res: Response)=>{

        const {email,password}=req.body

        const existingUser = await User.findOne({email});

        if (existingUser){
            throw new BadRequestError('Email in use');
        }

        const user = User.build({email,password});
        await user.save();

        //generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email

        },process.env.JWT_KEY!);

        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user)

});

export {router as signupRouter};