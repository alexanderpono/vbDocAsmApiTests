import { AsmScript, CoursesUsers } from './services/index';

export const coursesApiProvider = () => ({
    users: () => new CoursesUsers()
});

export const docAsmApiProvider = () => ({
    script: () => new AsmScript()
});
