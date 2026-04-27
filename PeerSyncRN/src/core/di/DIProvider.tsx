import React, { createContext, useContext, useMemo } from "react";
import { TOKENS } from "./tokens";
import { AuthRemoteDataSourceImp } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { Container } from "./container";

import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { CourseRemoteSourceImpl } from "@/src/features/courses/data/datasources/CourseRemoteSourceImpl";
import { CourseRepositoryImpl } from "@/src/features/courses/data/repositories/CourseRepositoryImpl";

import { CategoryRemoteSourceImpl } from "@/src/features/categories/data/datasources/CategoryRemoteSourceImpl";
import { CategoryRepositoryImpl } from "@/src/features/categories/data/repositories/CategoryRepositoryImpl";

import { EvaluationRemoteSourceImpl } from "@/src/features/evaluations/data/datasources/EvaluationRemoteSourceImpl";
import { EvaluationRepositoryImpl } from "@/src/features/evaluations/data/repositories/EvaluationRepositoryImpl";
import { EvaluationAnalyticsRemoteSourceImpl } from "@/src/features/evaluations/data/datasources/EvaluationAnalyticsRemoteSourceImpl";
import { EvaluationAnalyticsRepositoryImpl } from "@/src/features/evaluations/data/repositories/EvaluationAnalyticsRepositoryImpl";
import { GroupRepositoryImpl } from "@/src/features/groups/data/repositories/GroupRepositoryImpl";
import { GroupRemoteDataSourceImpl } from "@/src/features/groups/data/datasources/GroupRemoteDataSourceImpl";

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();

        // 1. Instanciamos LocalPreferences (es un Singleton por tu diseño)
        const localPrefs = LocalPreferencesAsyncStorage.getInstance();
        c.register(TOKENS.LocalPreferences, localPrefs);

        // 2. Dependencias de Auth
        const authDS = new AuthRemoteDataSourceImp();
        const authRepo = new AuthRepositoryImpl(authDS);

        c.register(TOKENS.AuthRemoteDS, authDS)
         .register(TOKENS.AuthRepo, authRepo);

        // 3. Dependencias de Cursos
        const courseDS = new CourseRemoteSourceImpl(localPrefs);
        const courseRepo = new CourseRepositoryImpl(courseDS, authRepo, localPrefs);

        c.register(TOKENS.CourseRemoteDS, courseDS)
         .register(TOKENS.CourseRepo, courseRepo);

        // 👇 4. Dependencias de Categorías
        const categoryDS = new CategoryRemoteSourceImpl(localPrefs);
        const categoryRepo = new CategoryRepositoryImpl(categoryDS, authRepo, localPrefs);

        c.register(TOKENS.CategoryRemoteDS, categoryDS)
         .register(TOKENS.CategoryRepo, categoryRepo);

         // 5. Dependencias de Evaluaciones
        const evalDS = new EvaluationRemoteSourceImpl(localPrefs);
        const evalRepo = new EvaluationRepositoryImpl(evalDS, localPrefs);

        const evalAnalyticsDS = new EvaluationAnalyticsRemoteSourceImpl(localPrefs);
        const evalAnalyticsRepo = new EvaluationAnalyticsRepositoryImpl(evalAnalyticsDS);

        c.register(TOKENS.EvaluationRemoteDS, evalDS)
         .register(TOKENS.EvaluationRepo, evalRepo)
         .register(TOKENS.EvaluationAnalyticsRemoteDS, evalAnalyticsDS)
         .register(TOKENS.EvaluationAnalyticsRepo, evalAnalyticsRepo);

         // Dependencias de Grupos
        const groupDS = new GroupRemoteDataSourceImpl(localPrefs);
        const groupRepo = new GroupRepositoryImpl(groupDS);

        c.register(TOKENS.GroupRemoteDS, groupDS)
         .register(TOKENS.GroupRepo, groupRepo);


        const remoteDS = new ProductRemoteDataSourceImp(authDS);
        const productRepo = new ProductRepositoryImpl(remoteDS);

        c.register(TOKENS.ProductRemoteDS, remoteDS)
            .register(TOKENS.ProductRepo, productRepo);



        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
