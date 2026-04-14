"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const alunos_module_1 = require("./alunos/alunos.module");
const checkin_module_1 = require("./checkin/checkin.module");
const media_module_1 = require("./media/media.module");
const websocket_module_1 = require("./websocket/websocket.module");
const tenant_entity_1 = require("./tenants/tenant.entity");
const user_entity_1 = require("./users/user.entity");
const aluno_entity_1 = require("./alunos/aluno.entity");
const responsavel_aluno_entity_1 = require("./responsavel-aluno/responsavel-aluno.entity");
const checkin_entity_1 = require("./checkin/checkin.entity");
const media_entity_1 = require("./media/media.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.get('DATABASE_URL'),
                    entities: [tenant_entity_1.Tenant, user_entity_1.User, aluno_entity_1.Aluno, responsavel_aluno_entity_1.ResponsavelAluno, checkin_entity_1.Checkin, media_entity_1.Media],
                    synchronize: true,
                    logging: false,
                }),
                inject: [config_1.ConfigService],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            alunos_module_1.AlunosModule,
            checkin_module_1.CheckinModule,
            media_module_1.MediaModule,
            websocket_module_1.WebsocketModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map