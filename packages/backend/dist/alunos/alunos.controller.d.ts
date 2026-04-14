import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
export declare class AlunosController {
    private service;
    constructor(service: AlunosService);
    findAll(user: any, tenantId?: string): Promise<import("./aluno.entity").Aluno[]>;
    findResponsaveis(id: string): Promise<any[]>;
    findOne(id: string, user: any): Promise<import("./aluno.entity").Aluno>;
    create(dto: CreateAlunoDto, user: any): Promise<import("./aluno.entity").Aluno>;
    update(id: string, dto: Partial<CreateAlunoDto>, user: any): Promise<import("./aluno.entity").Aluno>;
    remove(id: string, user: any): Promise<{
        success: boolean;
    }>;
    vincularResponsavel(id: string, responsavelId: string, user: any): Promise<import("../responsavel-aluno/responsavel-aluno.entity").ResponsavelAluno>;
    desvincularResponsavel(id: string, responsavelId: string): Promise<{
        success: boolean;
    }>;
    uploadFoto(id: string, file: Express.Multer.File, user: any): Promise<import("./aluno.entity").Aluno>;
}
