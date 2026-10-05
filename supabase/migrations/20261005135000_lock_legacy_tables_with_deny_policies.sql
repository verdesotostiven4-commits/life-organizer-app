-- Hace explícito el bloqueo de las tablas legacy.
-- Conserva los datos históricos, pero deniega toda operación a anon/authenticated.

DROP POLICY IF EXISTS legacy_locked ON public.daily_habits_log;
CREATE POLICY legacy_locked ON public.daily_habits_log
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.class_schedule;
CREATE POLICY legacy_locked ON public.class_schedule
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.attendance_logs;
CREATE POLICY legacy_locked ON public.attendance_logs
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.grades;
CREATE POLICY legacy_locked ON public.grades
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.grocery_budgets;
CREATE POLICY legacy_locked ON public.grocery_budgets
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.grocery_items;
CREATE POLICY legacy_locked ON public.grocery_items
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.financial_transactions;
CREATE POLICY legacy_locked ON public.financial_transactions
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS legacy_locked ON public.debts_pending;
CREATE POLICY legacy_locked ON public.debts_pending
FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
