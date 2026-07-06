/**
 * Venue RLS is fixed by running SQL in Supabase (JWT user_metadata), not via client RPC.
 *
 * Run in Supabase SQL Editor: scripts/venues-rls-jwt-metadata.sql
 *
 * Old policies used auth.jwt() ->> 'role', which is the Postgres role ("authenticated"),
 * not session.user.user_metadata.role — deletes were blocked by RLS.
 */

// eslint-disable-next-line no-console
console.log(
  "Venue RLS: open scripts/venues-rls-jwt-metadata.sql and run it in the Supabase SQL Editor."
)
process.exit(0)
