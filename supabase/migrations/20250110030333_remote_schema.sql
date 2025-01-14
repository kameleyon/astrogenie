drop policy "Users can read/write their own profile" on "public"."profiles";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

create table "public"."astrological_readings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "question" text not null,
    "response" text not null,
    "is_bookmarked" boolean default false,
    "parent_id" uuid
);


alter table "public"."astrological_readings" enable row level security;

create table "public"."notification_preferences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "email_updates" boolean not null default true,
    "reading_reminders" boolean not null default false,
    "marketing_emails" boolean not null default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."notification_preferences" enable row level security;

create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text not null,
    "price" numeric(10,2) not null,
    "category" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."reports" enable row level security;

create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "status" text not null,
    "credits_remaining" integer not null default 2500,
    "rollover_credits" integer not null default 0,
    "trial_end_date" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "stripe_subscription_id" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "success_url" text
);


alter table "public"."subscriptions" enable row level security;

alter table "public"."profiles" add column "ascendant" text;

alter table "public"."profiles" add column "birth_chart_aspects" jsonb;

alter table "public"."profiles" add column "birth_chart_description" text;

alter table "public"."profiles" add column "birth_chart_houses" jsonb;

alter table "public"."profiles" add column "birth_chart_planets" jsonb;

alter table "public"."profiles" add column "cardology_card" text;

alter table "public"."profiles" add column "created_at" timestamp with time zone not null default timezone('utc'::text, now());

alter table "public"."profiles" add column "human_design_type" text;

alter table "public"."profiles" add column "life_path_number" text;

alter table "public"."profiles" add column "moon_sign" text;

alter table "public"."profiles" add column "sun_sign" text;

alter table "public"."profiles" alter column "birth_date" set data type date using "birth_date"::date;

alter table "public"."profiles" alter column "birth_time" set data type time without time zone using "birth_time"::time without time zone;

alter table "public"."profiles" alter column "email" set not null;

CREATE UNIQUE INDEX astrological_readings_pkey ON public.astrological_readings USING btree (id);

CREATE INDEX idx_astrological_readings_parent_id ON public.astrological_readings USING btree (parent_id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);

CREATE UNIQUE INDEX notification_preferences_user_id_key ON public.notification_preferences USING btree (user_id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

alter table "public"."astrological_readings" add constraint "astrological_readings_pkey" PRIMARY KEY using index "astrological_readings_pkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."astrological_readings" add constraint "astrological_readings_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES astrological_readings(id) not valid;

alter table "public"."astrological_readings" validate constraint "astrological_readings_parent_id_fkey";

alter table "public"."astrological_readings" add constraint "astrological_readings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."astrological_readings" validate constraint "astrological_readings_user_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "notification_preferences_user_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_key" UNIQUE using index "notification_preferences_user_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_status_check" CHECK ((status = ANY (ARRAY['trial'::text, 'active'::text, 'cancelled'::text, 'expired'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_status_check";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_trial_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    status,
    credits_remaining,
    trial_end_date
  )
  VALUES (
    NEW.id,
    'trial',
    1000, -- Changed from 2500 to 1000 for trial users
    NOW() + INTERVAL '3 days'
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_credits(p_user_id uuid, p_credits_used integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE subscriptions
  SET credits_remaining = credits_remaining - p_credits_used
  WHERE user_id = p_user_id AND credits_remaining >= p_credits_used;
END;
$function$
;

grant delete on table "public"."astrological_readings" to "anon";

grant insert on table "public"."astrological_readings" to "anon";

grant references on table "public"."astrological_readings" to "anon";

grant select on table "public"."astrological_readings" to "anon";

grant trigger on table "public"."astrological_readings" to "anon";

grant truncate on table "public"."astrological_readings" to "anon";

grant update on table "public"."astrological_readings" to "anon";

grant delete on table "public"."astrological_readings" to "authenticated";

grant insert on table "public"."astrological_readings" to "authenticated";

grant references on table "public"."astrological_readings" to "authenticated";

grant select on table "public"."astrological_readings" to "authenticated";

grant trigger on table "public"."astrological_readings" to "authenticated";

grant truncate on table "public"."astrological_readings" to "authenticated";

grant update on table "public"."astrological_readings" to "authenticated";

grant delete on table "public"."astrological_readings" to "service_role";

grant insert on table "public"."astrological_readings" to "service_role";

grant references on table "public"."astrological_readings" to "service_role";

grant select on table "public"."astrological_readings" to "service_role";

grant trigger on table "public"."astrological_readings" to "service_role";

grant truncate on table "public"."astrological_readings" to "service_role";

grant update on table "public"."astrological_readings" to "service_role";

grant delete on table "public"."notification_preferences" to "anon";

grant insert on table "public"."notification_preferences" to "anon";

grant references on table "public"."notification_preferences" to "anon";

grant select on table "public"."notification_preferences" to "anon";

grant trigger on table "public"."notification_preferences" to "anon";

grant truncate on table "public"."notification_preferences" to "anon";

grant update on table "public"."notification_preferences" to "anon";

grant delete on table "public"."notification_preferences" to "authenticated";

grant insert on table "public"."notification_preferences" to "authenticated";

grant references on table "public"."notification_preferences" to "authenticated";

grant select on table "public"."notification_preferences" to "authenticated";

grant trigger on table "public"."notification_preferences" to "authenticated";

grant truncate on table "public"."notification_preferences" to "authenticated";

grant update on table "public"."notification_preferences" to "authenticated";

grant delete on table "public"."notification_preferences" to "service_role";

grant insert on table "public"."notification_preferences" to "service_role";

grant references on table "public"."notification_preferences" to "service_role";

grant select on table "public"."notification_preferences" to "service_role";

grant trigger on table "public"."notification_preferences" to "service_role";

grant truncate on table "public"."notification_preferences" to "service_role";

grant update on table "public"."notification_preferences" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

create policy "Users can create their own readings"
on "public"."astrological_readings"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own readings"
on "public"."astrological_readings"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update bookmarks on their readings"
on "public"."astrological_readings"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own readings"
on "public"."astrological_readings"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their notification preferences"
on "public"."notification_preferences"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can update their own notification preferences"
on "public"."notification_preferences"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own notification preferences"
on "public"."notification_preferences"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for all
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own birth chart"
on "public"."profiles"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Anyone can view reports"
on "public"."reports"
as permissive
for select
to public
using (true);


create policy "Users can insert their own subscription"
on "public"."subscriptions"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can update their own subscription"
on "public"."subscriptions"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own subscription"
on "public"."subscriptions"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "update_credits_policy"
on "public"."subscriptions"
as permissive
for update
to public
using ((auth.uid() = user_id));


CREATE TRIGGER on_user_created_notifications AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_user_notifications();

CREATE TRIGGER on_user_created_trial AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION create_trial_subscription();


