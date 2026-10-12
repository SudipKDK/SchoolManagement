import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    // Attached by requireAuth middleware
    user?: {
      id: string;
    };
    
    // Attached by requireSchool middleware (Multi-tenant context)
    schoolId?: string;
  }
}

export { };