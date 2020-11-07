import { Router, Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../classes/token';
import { verificaToken } from '../middlewares/autenticacion';
const userRoutes = Router();

// Login de usuario
userRoutes.post('/login', (req: Request, res: Response) =>{

    const body = req.body;

    Usuario.findOne({email: body.email}, (err, userDb) =>{
        if(err) throw err;

        if(!userDb){
            return res.json({
                ok: false,
                mensaje: 'El usuario o la contraseña no son correctos'
            });
        }

        if(userDb.compararPassword(body.password)){
            const token = Token.getJwToken({
                _id: userDb._id,
                nombre: userDb.nombre,
                email: userDb.email,
                avatar: userDb.avatar
            });

            return res.json({
                ok: true,
                token: token
            });
        } else{
            return res.json({
                ok: false,
                mensaje: 'El usuario o la contraseña no son correctos'
            });
        }
    });
});

// Crear usuario
userRoutes.post('/create', (req: Request, res: Response) => {
    const user = {
        nombre: req.body.nombre, 
        email: req.body.email, 
        password: bcrypt.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    };

    Usuario.create( user ).then( (userDb) => {
        const token = Token.getJwToken({
            _id: userDb._id,
            nombre: userDb.nombre,
            email: userDb.email,
            avatar: userDb.avatar
        });

        return res.json({
            ok: true,
            token: token
        });
    }).catch( err => {
        res.json({
            ok: false,
            err: err
        });
    });
});

userRoutes.post('/update', [verificaToken], (req: any, res: Response) => {
    
    const user = {
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email || req.usuario.email,
        avatar: req.body.avatar || req.usuario.avatar
    };

    Usuario.findByIdAndUpdate( req.usuario._id, user, { new: true }, (err, userDb) => {
        if( err ) throw err;

        if (!userDb){
            return res.json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID'
            });
        }

        const token = Token.getJwToken({
            _id: userDb._id,
            nombre: userDb.nombre,
            email: userDb.email,
            avatar: userDb.avatar
        });

        res.json({
            ok: true,
            token
        });
    });

    
});

// Obtener información de usuario
userRoutes.get('/', [verificaToken], (req: any, res: Response) => {
    const usuario = req.usuario;
    
    res.json({
        ok: true,
        usuario
    });
});


export default userRoutes;