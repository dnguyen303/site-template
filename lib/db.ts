import postgres from 'postgres';

// Small pool and short idle timeout: multiple sites share one Postgres on a
// memory-constrained box, so keep connections low and release idle ones.
const sql = postgres(process.env.DATABASE_URL!, {
  max: 3,
  idle_timeout: 20,
});

export default sql;
