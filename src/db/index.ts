import { drizzle } from "drizzle-orm/node-postgres";
import { getTableName, is } from "drizzle-orm";
import { Pool } from "pg";
import {
  bookmarks,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  sessions,
  users,
  type Course,
  type Lesson,
  type User,
} from "./schema";

const databaseUrl = process.env.DATABASE_URL;

/* ------------------------------------------------------------------ */
/* In-Memory Store & Fallback Mock                                     */
/* ------------------------------------------------------------------ */

const INITIAL_COURSES: Course[] = [
  {
    id: 1,
    slug: "calculus",
    title: "Calculus & Analysis",
    tagline: "Limits, derivatives, integration, multivariable optimization and Stokes' theorem.",
    description:
      "Build the ε–delta foundation, master differentiation as linear approximation, and finish with vector calculus and Stokes' theorem.",
    category: "Analysis",
    level: "Intermediate",
    accent: "blue",
    emoji: "∫",
    hours: 8,
    sortOrder: 1,
    published: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    slug: "linear-algebra",
    title: "Linear Algebra & SVD",
    tagline: "Vector spaces, linear transformations, determinants, spectral theory, and SVD.",
    description:
      "Treat matrices as linear maps. Diagonalise symmetric matrices, understand Rayleigh quotients, and derive the Singular Value Decomposition.",
    category: "Algebra",
    level: "Intermediate",
    accent: "emerald",
    emoji: "▦",
    hours: 7,
    sortOrder: 2,
    published: true,
    createdAt: new Date(),
  },
  {
    id: 3,
    slug: "modern-algebra",
    title: "Modern Algebra",
    tagline: "Groups, Lagrange's theorem, quotient structures, and field extensions.",
    description:
      "The structural side of mathematics. Learn cosets, normal subgroups, ring homomorphisms, and the First Isomorphism Theorem.",
    category: "Structure",
    level: "Advanced",
    accent: "purple",
    emoji: "◈",
    hours: 10,
    sortOrder: 3,
    published: true,
    createdAt: new Date(),
  },
  {
    id: 4,
    slug: "probability",
    title: "Probability & Stochastic Models",
    tagline: "Kolmogorov axioms, Bayes' theorem, CLT, and Markov chains.",
    description:
      "From probability foundations to limit theorems and Markov chains used in statistics and machine learning.",
    category: "Chance",
    level: "Advanced",
    accent: "amber",
    emoji: "🎲",
    hours: 9,
    sortOrder: 4,
    published: true,
    createdAt: new Date(),
  },
];

const INITIAL_LESSONS: Lesson[] = [
  {
    id: 1,
    courseId: 1,
    slug: "calculus",
    title: "Calculus: Rate of Change to Stokes' Theorem",
    summary: "ε–delta limits, optimization, and Stokes' theorem.",
    collection: "courses",
    mdxPath: "content/courses/calculus.mdx",
    youtubeId: "WUvTyaaNkzM",
    youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    minutes: 22,
    sortOrder: 0,
  },
  {
    id: 2,
    courseId: 1,
    slug: "intuition-behind-calculus",
    title: "The Intuition Behind Calculus",
    summary: "Slope and accumulation as two views of one object.",
    collection: "blog",
    mdxPath: "content/blog/intuition-behind-calculus.mdx",
    youtubeId: "9vKqVkMQHKk",
    youtubeUrl: "https://www.youtube.com/watch?v=9vKqVkMQHKk",
    minutes: 11,
    sortOrder: 1,
  },
  {
    id: 3,
    courseId: 2,
    slug: "linear-algebra",
    title: "Vector Spaces to Singular Value Decomposition",
    summary: "Vector space axioms, linear maps, eigenvalues, and SVD.",
    collection: "courses",
    mdxPath: "content/courses/linear-algebra.mdx",
    youtubeId: "fNk_zzaMoSs",
    youtubeUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
    minutes: 24,
    sortOrder: 0,
  },
  {
    id: 4,
    courseId: 3,
    slug: "algebra",
    title: "Groups, Subgroups, and Field Extensions",
    summary: "Cosets, Lagrange's theorem, normality, and ring homomorphisms.",
    collection: "courses",
    mdxPath: "content/courses/algebra.mdx",
    youtubeId: "mH0oCDa74tE",
    youtubeUrl: "https://www.youtube.com/watch?v=mH0oCDa74tE",
    minutes: 26,
    sortOrder: 0,
  },
  {
    id: 5,
    courseId: 4,
    slug: "probability",
    title: "Kolmogorov Axioms to Central Limit Theorem",
    summary: "Bayes' rule, continuous densities, CLT, and Markov chains.",
    collection: "courses",
    mdxPath: "content/courses/probability.mdx",
    youtubeId: "HZGCoVF3YvM",
    youtubeUrl: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
    minutes: 25,
    sortOrder: 0,
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@mathcare.dev",
    passwordHash: "mathematics",
    role: "student",
    plan: "free",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Alan Turing",
    email: "alan@mathcare.dev",
    passwordHash: "mathematics",
    role: "student",
    plan: "free",
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Student Explorer",
    email: "student@mathcare.dev",
    passwordHash: "mathematics",
    role: "student",
    plan: "free",
    createdAt: new Date(),
  },
];

type MemStore = {
  users: Array<Record<string, any>>;
  sessions: Array<Record<string, any>>;
  courses: Array<Record<string, any>>;
  lessons: Array<Record<string, any>>;
  enrollments: Array<Record<string, any>>;
  lessonProgress: Array<Record<string, any>>;
  bookmarks: Array<Record<string, any>>;
  nextId: {
    users: number;
    courses: number;
    lessons: number;
    enrollments: number;
    lessonProgress: number;
    bookmarks: number;
  };
};

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaMemStore?: MemStore;
};

const memStore: MemStore =
  globalForDb.__arenaMemStore ??
  (globalForDb.__arenaMemStore = {
    users: [...INITIAL_USERS],
    sessions: [],
    courses: [...INITIAL_COURSES],
    lessons: [...INITIAL_LESSONS],
    enrollments: [],
    lessonProgress: [],
    bookmarks: [],
    nextId: {
      users: 4,
      courses: 5,
      lessons: 6,
      enrollments: 1,
      lessonProgress: 1,
      bookmarks: 1,
    },
  });

function resolveTableName(table: any): keyof Omit<MemStore, "nextId"> {
  try {
    if (typeof table === "string") return table as any;
    const name = getTableName(table);
    if (name === "users") return "users";
    if (name === "sessions") return "sessions";
    if (name === "courses") return "courses";
    if (name === "lessons") return "lessons";
    if (name === "enrollments") return "enrollments";
    if (name === "lesson_progress" || name === "lessonProgress") return "lessonProgress";
    if (name === "bookmarks") return "bookmarks";
  } catch {
    /* fallback */
  }
  if (table === users) return "users";
  if (table === sessions) return "sessions";
  if (table === courses) return "courses";
  if (table === lessons) return "lessons";
  if (table === enrollments) return "enrollments";
  if (table === lessonProgress) return "lessonProgress";
  if (table === bookmarks) return "bookmarks";
  return "courses";
}

function extractColInfo(col: any): { tableName?: string; colName: string } {
  if (!col) return { colName: "" };
  if (typeof col === "string") return { colName: col };

  let tableName: string | undefined;
  if (col.table) {
    try {
      tableName = resolveTableName(col.table);
    } catch {
      /* fallback */
    }
  }

  let colName = "";
  if (col.name) colName = col.name;
  else if (col._?.name) colName = col._.name;
  else if (col.fieldName) colName = col.fieldName;
  else colName = String(col);

  return { tableName, colName };
}

function extractColName(col: any): string {
  return extractColInfo(col).colName;
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
}

function getRowVal(row: Record<string, any>, colRef: any): any {
  if (!colRef || !row) return undefined;
  const { tableName, colName } = extractColInfo(colRef);
  if (!colName) return undefined;

  // If this is a joined row and table name matches a joined sub-object
  if (tableName && row[tableName] && typeof row[tableName] === "object") {
    const tableObj = row[tableName];
    if (colName in tableObj) return tableObj[colName];
    const camel = toCamel(colName);
    if (camel in tableObj) return tableObj[camel];
  }

  // Check top-level properties
  if (colName in row) return row[colName];
  const camel = toCamel(colName);
  if (camel in row) return row[camel];

  return undefined;
}

function evalCondition(cond: any, row: Record<string, any>): boolean {
  if (!cond) return true;
  if (cond.operator === "and" || Array.isArray(cond.conditions)) {
    const list = cond.conditions || cond.chunks || [];
    return list.every((c: any) => evalCondition(c, row));
  }
  if (cond.operator === "or") {
    const list = cond.conditions || cond.chunks || [];
    return list.some((c: any) => evalCondition(c, row));
  }

  const left = cond.left ?? cond.column;
  const right = cond.right ?? cond.value;

  let rightVal: any;
  if (right && typeof right === "object" && ("name" in right || "table" in right || (right._ && right._.name))) {
    rightVal = getRowVal(row, right);
  } else if (right && typeof right === "object" && "value" in right) {
    rightVal = right.value;
  } else {
    rightVal = right;
  }

  const leftVal = getRowVal(row, left);

  const op = (cond.operator ?? cond.name ?? "=").toLowerCase();
  if (op === "=" || op === "eq") {
    if (leftVal == null || rightVal == null) return leftVal === rightVal;
    return leftVal === rightVal || String(leftVal) === String(rightVal);
  }
  if (op === ">" || op === "gt") {
    const lTime = leftVal instanceof Date ? leftVal.getTime() : typeof leftVal === "string" ? new Date(leftVal).getTime() : Number(leftVal);
    const rTime = rightVal instanceof Date ? rightVal.getTime() : typeof rightVal === "string" ? new Date(rightVal).getTime() : Number(rightVal);
    return lTime > rTime;
  }
  if (op === "<" || op === "lt") {
    const lTime = leftVal instanceof Date ? leftVal.getTime() : typeof leftVal === "string" ? new Date(leftVal).getTime() : Number(leftVal);
    const rTime = rightVal instanceof Date ? rightVal.getTime() : typeof rightVal === "string" ? new Date(rightVal).getTime() : Number(rightVal);
    return lTime < rTime;
  }
  return leftVal == rightVal;
}

class MockQueryBuilder implements PromiseLike<any[]> {
  private tableName: keyof Omit<MemStore, "nextId"> = "courses";
  private selectFields?: any;
  private whereCond?: any;
  private orderCol?: any;
  private orderDir: "asc" | "desc" = "asc";
  private limitCount?: number;
  private joinTable?: any;
  private joinOn?: any;

  constructor(selectFields?: any) {
    this.selectFields = selectFields;
  }

  from(table: any) {
    this.tableName = resolveTableName(table);
    return this;
  }

  innerJoin(table: any, onCond: any) {
    this.joinTable = table;
    this.joinOn = onCond;
    return this;
  }

  where(condition: any) {
    this.whereCond = condition;
    return this;
  }

  orderBy(orderClause: any) {
    if (orderClause) {
      if (orderClause.direction === "desc" || orderClause.type === "desc") {
        this.orderDir = "desc";
        this.orderCol = orderClause.column || orderClause;
      } else {
        this.orderDir = "asc";
        this.orderCol = orderClause.column || orderClause;
      }
    }
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  private executeSync(): any[] {
    let rows = [...(memStore[this.tableName] || [])];

    if (this.joinTable && this.joinOn) {
      const joinTableName = resolveTableName(this.joinTable);
      const joinRows = memStore[joinTableName] || [];
      const joined: any[] = [];
      for (const primary of rows) {
        for (const secondary of joinRows) {
          const combined = { ...primary, [this.tableName]: primary, [joinTableName]: secondary, user: secondary };
          if (evalCondition(this.joinOn, combined)) {
            joined.push(combined);
          }
        }
      }
      rows = joined;
    }

    if (this.whereCond) {
      rows = rows.filter((r) => evalCondition(this.whereCond, r));
    }

    if (this.orderCol) {
      rows.sort((a, b) => {
        const va = getRowVal(a, this.orderCol);
        const vb = getRowVal(b, this.orderCol);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va instanceof Date && vb instanceof Date) {
          return this.orderDir === "desc" ? vb.getTime() - va.getTime() : va.getTime() - vb.getTime();
        }
        if (va < vb) return this.orderDir === "desc" ? 1 : -1;
        if (va > vb) return this.orderDir === "desc" ? -1 : 1;
        return 0;
      });
    }

    if (this.limitCount != null) {
      rows = rows.slice(0, this.limitCount);
    }

    if (this.selectFields && typeof this.selectFields === "object") {
      // If select is counting
      if ("count" in this.selectFields) {
        return [{ count: rows.length }];
      }
      return rows.map((r) => {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(this.selectFields)) {
          if (k === "user") {
            out.user = r.user || r.users || r;
          } else {
            out[k] = getRowVal(r, v) ?? (r as any)[k];
          }
        }
        return out;
      });
    }

    return rows;
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.executeSync()).then(onfulfilled, onrejected);
  }
}

class MockInsertBuilder implements PromiseLike<any[]> {
  private tableName: keyof Omit<MemStore, "nextId">;
  private valuesToInsert: any[] = [];
  private returnFields?: any;

  constructor(table: any) {
    this.tableName = resolveTableName(table);
  }

  values(vals: any | any[]) {
    this.valuesToInsert = Array.isArray(vals) ? vals : [vals];
    return this;
  }

  onConflictDoNothing() {
    return this;
  }

  returning(fields?: any) {
    this.returnFields = fields;
    return this;
  }

  private executeSync(): any[] {
    const list = memStore[this.tableName];
    const insertedRows: any[] = [];

    for (const v of this.valuesToInsert) {
      const nextIdKey = this.tableName as keyof typeof memStore.nextId;
      const id = v.id ?? (memStore.nextId[nextIdKey] ? memStore.nextId[nextIdKey]++ : Date.now());
      const row = { id, createdAt: new Date(), ...v };
      list.push(row);
      insertedRows.push(row);
    }

    if (this.returnFields) {
      return insertedRows.map((r) => {
        const out: Record<string, any> = {};
        for (const [k, col] of Object.entries(this.returnFields)) {
          out[k] = getRowVal(r, col) ?? r[k];
        }
        return out;
      });
    }
    return insertedRows;
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.executeSync()).then(onfulfilled, onrejected);
  }
}

class MockDeleteBuilder implements PromiseLike<any> {
  private tableName: keyof Omit<MemStore, "nextId">;
  private whereCond?: any;

  constructor(table: any) {
    this.tableName = resolveTableName(table);
  }

  where(condition: any) {
    this.whereCond = condition;
    return this;
  }

  private executeSync(): any {
    if (!this.whereCond) {
      memStore[this.tableName] = [];
      return { rowCount: 0 };
    }
    const before = memStore[this.tableName].length;
    memStore[this.tableName] = memStore[this.tableName].filter((r) => !evalCondition(this.whereCond, r));
    const after = memStore[this.tableName].length;
    return { rowCount: before - after };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.executeSync()).then(onfulfilled, onrejected);
  }
}

class MockUpdateBuilder implements PromiseLike<any[]> {
  private tableName: keyof Omit<MemStore, "nextId">;
  private updateValues: Record<string, any> = {};
  private whereCond?: any;
  private returnFields?: any;

  constructor(table: any) {
    this.tableName = resolveTableName(table);
  }

  set(values: Record<string, any>) {
    this.updateValues = values;
    return this;
  }

  where(condition: any) {
    this.whereCond = condition;
    return this;
  }

  returning(fields?: any) {
    this.returnFields = fields;
    return this;
  }

  private executeSync(): any[] {
    const list = memStore[this.tableName];
    const updatedRows: any[] = [];

    for (let i = 0; i < list.length; i++) {
      if (!this.whereCond || evalCondition(this.whereCond, list[i])) {
        list[i] = { ...list[i], ...this.updateValues };
        updatedRows.push(list[i]);
      }
    }

    if (this.returnFields) {
      return updatedRows.map((r) => {
        const out: Record<string, any> = {};
        for (const [k, col] of Object.entries(this.returnFields)) {
          out[k] = getRowVal(r, col) ?? r[k];
        }
        return out;
      });
    }
    return updatedRows;
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.executeSync()).then(onfulfilled, onrejected);
  }
}

const mockDb = {
  select: (fields?: any) => new MockQueryBuilder(fields),
  insert: (table: any) => new MockInsertBuilder(table),
  update: (table: any) => new MockUpdateBuilder(table),
  delete: (table: any) => new MockDeleteBuilder(table),
  execute: async () => ({ rows: [{ "?column?": 1 }] }),
};

/* ------------------------------------------------------------------ */
/* Real / Fallback Connection Factory                                  */
/* ------------------------------------------------------------------ */

export let pool: Pool | null = null;
let realDrizzle: any = null;

if (databaseUrl && databaseUrl.trim().length > 0) {
  try {
    pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }
    realDrizzle = drizzle(pool);
  } catch {
    console.warn("[AI Studio] Database connection failed - using in-memory mock store.");
  }
}

export const db = (realDrizzle ?? mockDb) as unknown as ReturnType<typeof drizzle>;
