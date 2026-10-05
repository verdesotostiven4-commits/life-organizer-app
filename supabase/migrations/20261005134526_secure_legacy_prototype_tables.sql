-- Cierra las tablas del prototipo antiguo sin eliminar sus datos.
-- Al no definir políticas RLS, anon/authenticated no pueden leerlas ni modificarlas.
ALTER TABLE public.daily_habits_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts_pending ENABLE ROW LEVEL SECURITY;
