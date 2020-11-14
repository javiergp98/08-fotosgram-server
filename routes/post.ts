import { Router, Response } from 'express';
import { verificaToken } from '../middlewares/autenticacion';
import { Post } from '../models/post.model';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from '../classes/file-system';

const postRoutes = Router();
const fileSystem = new FileSystem();

// Obtener POST paginados
postRoutes.get('/', async (req: any, res: Response) => {

    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina -1;
    skip = skip * 10;

    const posts = await Post.find().sort({ _id: -1}).skip(skip).limit(10).populate('usuario', '-password').exec();

    res.json({
        ok: true,
        pagina,
        posts
    });
});

// Crear POST
postRoutes.post('/', [verificaToken], (req: any, res: Response) => {

    const body = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesTempToPost(req.usuario._id);
    body.imgs = imagenes;


    Post.create(body).then(async postDb =>{

        await postDb.populate('usuario', '-password').execPopulate();

        res.json({
            ok: true,
            post: postDb
        });
    }).catch(err =>{
        res.json(err);
    } );


});


// Servicio para subir archivos
postRoutes.post('/upload', [verificaToken], async (req: any, res: Response) =>{
    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió el archivo'
        });
    }

    const file: FileUpload = req.files.image;


    // En el caso de que no exista un archivo
    if(!file){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningún archivo - image'
        });
    }

    // En el caso de que el archivo subido no sea una imagen
    if(!file.mimetype.includes('image')){
        return res.status(400).json({
            ok: false,
            mensaje: 'El archivo subido no es una imagen'
        });
    }

    await fileSystem.guardarImagenTemporal(file, req.usuario._id);

    return res.json({
        ok: true,
        file: file.mimetype
    });
});


// Obtener imagen
postRoutes.get('/imagen/:userid/:img', (req: any, res: Response ) => {
    const userId = req.params.userid;
    const img = req.params.img;

    const pathFoto = fileSystem.getFotoUrl(userId, img);

    res.sendFile(pathFoto);
});

export default postRoutes;