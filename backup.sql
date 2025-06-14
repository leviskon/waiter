--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'OPEN',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentType" AS ENUM (
    'CASH',
    'CARD',
    'QR',
    'OTHER'
);


ALTER TYPE public."PaymentType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'MANAGER',
    'ADMIN',
    'CASHIER',
    'WAITER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Delivery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Delivery" (
    id integer NOT NULL,
    "ingredientId" integer NOT NULL,
    "supplierId" integer NOT NULL,
    quantity numeric(65,30) NOT NULL,
    "pricePerUnit" numeric(65,30) NOT NULL,
    "deliveryDate" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL
);


ALTER TABLE public."Delivery" OWNER TO postgres;

--
-- Name: Delivery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Delivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Delivery_id_seq" OWNER TO postgres;

--
-- Name: Delivery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Delivery_id_seq" OWNED BY public."Delivery".id;


--
-- Name: Ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ingredient" (
    id integer NOT NULL,
    name text NOT NULL,
    unit text NOT NULL,
    "currentPrice" numeric(65,30) NOT NULL,
    "inStock" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Ingredient" OWNER TO postgres;

--
-- Name: IngredientStopList; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IngredientStopList" (
    id integer NOT NULL,
    "ingredientId" integer NOT NULL,
    "shiftId" integer NOT NULL
);


ALTER TABLE public."IngredientStopList" OWNER TO postgres;

--
-- Name: IngredientStopList_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."IngredientStopList_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."IngredientStopList_id_seq" OWNER TO postgres;

--
-- Name: IngredientStopList_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."IngredientStopList_id_seq" OWNED BY public."IngredientStopList".id;


--
-- Name: Ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Ingredient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Ingredient_id_seq" OWNER TO postgres;

--
-- Name: Ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Ingredient_id_seq" OWNED BY public."Ingredient".id;


--
-- Name: MenuIngredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MenuIngredient" (
    id integer NOT NULL,
    "menuItemId" integer NOT NULL,
    "ingredientId" integer NOT NULL,
    quantity numeric(65,30) NOT NULL
);


ALTER TABLE public."MenuIngredient" OWNER TO postgres;

--
-- Name: MenuIngredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MenuIngredient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuIngredient_id_seq" OWNER TO postgres;

--
-- Name: MenuIngredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MenuIngredient_id_seq" OWNED BY public."MenuIngredient".id;


--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MenuItem" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(65,30) NOT NULL,
    "costPrice" numeric(65,30) NOT NULL,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL
);


ALTER TABLE public."MenuItem" OWNER TO postgres;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MenuItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuItem_id_seq" OWNER TO postgres;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MenuItem_id_seq" OWNED BY public."MenuItem".id;


--
-- Name: MenuStopList; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MenuStopList" (
    id integer NOT NULL,
    "menuItemId" integer NOT NULL,
    "shiftId" integer NOT NULL
);


ALTER TABLE public."MenuStopList" OWNER TO postgres;

--
-- Name: MenuStopList_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MenuStopList_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuStopList_id_seq" OWNER TO postgres;

--
-- Name: MenuStopList_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MenuStopList_id_seq" OWNED BY public."MenuStopList".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "tableNumber" text NOT NULL,
    status public."OrderStatus" DEFAULT 'OPEN'::public."OrderStatus" NOT NULL,
    "totalPrice" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "waiterId" text NOT NULL,
    "cashierId" text,
    "shiftId" integer NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "menuItemId" integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(65,30) NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItem_id_seq" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    amount numeric(65,30) NOT NULL,
    "paymentType" public."PaymentType" NOT NULL,
    "paidById" text NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Payment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Payment_id_seq" OWNER TO postgres;

--
-- Name: Payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Payment_id_seq" OWNED BY public."Payment".id;


--
-- Name: Shift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shift" (
    id integer NOT NULL,
    "startedAt" timestamp(3) without time zone NOT NULL,
    "endedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "managerId" text NOT NULL
);


ALTER TABLE public."Shift" OWNER TO postgres;

--
-- Name: ShiftStaff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftStaff" (
    id integer NOT NULL,
    "shiftId" integer NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."ShiftStaff" OWNER TO postgres;

--
-- Name: ShiftStaff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ShiftStaff_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ShiftStaff_id_seq" OWNER TO postgres;

--
-- Name: ShiftStaff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ShiftStaff_id_seq" OWNED BY public."ShiftStaff".id;


--
-- Name: Shift_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Shift_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Shift_id_seq" OWNER TO postgres;

--
-- Name: Shift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Shift_id_seq" OWNED BY public."Shift".id;


--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Supplier" (
    id integer NOT NULL,
    name text NOT NULL,
    phone text
);


ALTER TABLE public."Supplier" OWNER TO postgres;

--
-- Name: Supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Supplier_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Supplier_id_seq" OWNER TO postgres;

--
-- Name: Supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Supplier_id_seq" OWNED BY public."Supplier".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Delivery id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delivery" ALTER COLUMN id SET DEFAULT nextval('public."Delivery_id_seq"'::regclass);


--
-- Name: Ingredient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredient" ALTER COLUMN id SET DEFAULT nextval('public."Ingredient_id_seq"'::regclass);


--
-- Name: IngredientStopList id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IngredientStopList" ALTER COLUMN id SET DEFAULT nextval('public."IngredientStopList_id_seq"'::regclass);


--
-- Name: MenuIngredient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuIngredient" ALTER COLUMN id SET DEFAULT nextval('public."MenuIngredient_id_seq"'::regclass);


--
-- Name: MenuItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuItem" ALTER COLUMN id SET DEFAULT nextval('public."MenuItem_id_seq"'::regclass);


--
-- Name: MenuStopList id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuStopList" ALTER COLUMN id SET DEFAULT nextval('public."MenuStopList_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: Payment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment" ALTER COLUMN id SET DEFAULT nextval('public."Payment_id_seq"'::regclass);


--
-- Name: Shift id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift" ALTER COLUMN id SET DEFAULT nextval('public."Shift_id_seq"'::regclass);


--
-- Name: ShiftStaff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftStaff" ALTER COLUMN id SET DEFAULT nextval('public."ShiftStaff_id_seq"'::regclass);


--
-- Name: Supplier id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier" ALTER COLUMN id SET DEFAULT nextval('public."Supplier_id_seq"'::regclass);


--
-- Data for Name: Delivery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Delivery" (id, "ingredientId", "supplierId", quantity, "pricePerUnit", "deliveryDate", "createdById") FROM stdin;
\.


--
-- Data for Name: Ingredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ingredient" (id, name, unit, "currentPrice", "inStock", "createdAt") FROM stdin;
11	╨б╨▓╨╕╨╜╨╕╨╜╨░	╨║╨│	250.000000000000000000000000000000	40.000000000000000000000000000000	2025-06-03 10:33:21.939
14	╨а╤Л╨▒╨░	╨║╨│	220.000000000000000000000000000000	35.000000000000000000000000000000	2025-06-03 10:33:21.939
22	╨Ъ╨░╨┐╤Г╤Б╤В╨░	╨║╨│	50.000000000000000000000000000000	60.000000000000000000000000000000	2025-06-03 10:33:21.939
23	╨а╨╕╤Б	╨║╨│	70.000000000000000000000000000000	100.000000000000000000000000000000	2025-06-03 10:33:21.939
25	╨Ь╨░╨║╨░╤А╨╛╨╜╤Л	╨║╨│	60.000000000000000000000000000000	120.000000000000000000000000000000	2025-06-03 10:33:21.939
27	╨б╤Л╤А	╨║╨│	400.000000000000000000000000000000	15.000000000000000000000000000000	2025-06-03 10:33:21.939
29	╨Т╨╡╤В╤З╨╕╨╜╨░	╨║╨│	300.000000000000000000000000000000	25.000000000000000000000000000000	2025-06-03 10:33:21.939
30	╨и╨┐╨╕╨╜╨░╤В	╨║╨│	100.000000000000000000000000000000	30.000000000000000000000000000000	2025-06-03 10:33:21.939
32	╨Ь╨░╨╣╨╛╨╜╨╡╨╖	╨╗	80.000000000000000000000000000000	50.000000000000000000000000000000	2025-06-03 10:33:21.939
33	╨Ъ╨╡╤В╤З╤Г╨┐	╨╗	70.000000000000000000000000000000	50.000000000000000000000000000000	2025-06-03 10:33:21.939
34	╨з╨░╨╣	╤Г╨┐╨░╨║	200.000000000000000000000000000000	40.000000000000000000000000000000	2025-06-03 10:33:21.939
35	╨Ъ╨╛╤Д╨╡	╤Г╨┐╨░╨║	500.000000000000000000000000000000	20.000000000000000000000000000000	2025-06-03 10:33:21.939
36	╨Ы╨╕╨╝╨╛╨╜	╤И╤В	30.000000000000000000000000000000	60.000000000000000000000000000000	2025-06-03 10:33:21.939
37	╨Р╨┐╨╡╨╗╤М╤Б╨╕╨╜╤Л	╨║╨│	80.000000000000000000000000000000	50.000000000000000000000000000000	2025-06-03 10:33:21.939
38	╨п╨▒╨╗╨╛╨║╨╕	╨║╨│	60.000000000000000000000000000000	70.000000000000000000000000000000	2025-06-03 10:33:21.939
39	╨С╨░╨╜╨░╨╜╤Л	╨║╨│	70.000000000000000000000000000000	60.000000000000000000000000000000	2025-06-03 10:33:21.939
19	╨Я╨╡╤А╨╡╤Ж ╨▒╨╛╨╗╨│╨░╤А╤Б╨║╨╕╨╣	╨║╨│	150.000000000000000000000000000000	24.000000000000000000000000000000	2025-06-03 10:33:21.939
40	╨Я╨╡╤В╤А╤Г╤И╨║╨░	╨║╨│	150.000000000000000000000000000000	14.920000000000000000000000000000	2025-06-03 10:33:21.939
31	╨У╤А╨╕╨▒╤Л	╨║╨│	250.000000000000000000000000000000	18.400000000000000000000000000000	2025-06-03 10:33:21.939
15	╨Ъ╨░╤А╤В╨╛╤Д╨╡╨╗╤М	╨║╨│	20.000000000000000000000000000000	97.200000000000000000000000000000	2025-06-03 10:33:21.939
7	╨б╨╗╨╕╨▓╨║╨╕	╨╗	150.000000000000000000000000000000	19.200000000000000000000000000000	2025-06-03 10:33:21.939
18	╨з╨╡╤Б╨╜╨╛╨║	╨║╨│	150.000000000000000000000000000000	19.960000000000000000000000000000	2025-06-03 10:33:21.939
9	╨в╨▓╨╛╤А╨╛╨│	╨║╨│	200.000000000000000000000000000000	23.400000000000000000000000000000	2025-06-03 10:33:21.939
10	╨п╨╣╤Ж╨░	╤И╤В	5.000000000000000000000000000000	91.000000000000000000000000000000	2025-06-03 10:33:21.939
2	╨б╨░╤Е╨░╤А	╨║╨│	50.000000000000000000000000000000	79.690000000000000000000000000000	2025-06-03 10:33:21.939
5	╨Ь╨░╤Б╨╗╨╛ ╤А╨░╤Б╤В╨╕╤В╨╡╨╗╤М╨╜╨╛╨╡	╨╗	120.000000000000000000000000000000	49.440000000000000000000000000000	2025-06-03 10:33:21.939
12	╨У╨╛╨▓╤П╨┤╨╕╨╜╨░	╨║╨│	300.000000000000000000000000000000	26.400000000000000000000000000000	2025-06-03 10:33:21.939
16	╨Ь╨╛╤А╨║╨╛╨▓╤М	╨║╨│	30.000000000000000000000000000000	76.960000000000000000000000000000	2025-06-03 10:33:21.939
1	╨Ь╤Г╨║╨░ ╨┐╤И╨╡╨╜╨╕╤З╨╜╨░╤П	╨║╨│	40.000000000000000000000000000000	94.280000000000000000000000000000	2025-06-03 10:33:21.939
8	╨б╨╝╨╡╤В╨░╨╜╨░	╨║╨│	100.000000000000000000000000000000	29.200000000000000000000000000000	2025-06-03 10:33:21.939
4	╨Ь╨░╤Б╨╗╨╛ ╤Б╨╗╨╕╨▓╨╛╤З╨╜╨╛╨╡	╨║╨│	300.000000000000000000000000000000	19.190000000000000000000000000000	2025-06-03 10:33:21.939
3	╨б╨╛╨╗╤М	╨║╨│	10.000000000000000000000000000000	199.683000000000000000000000000000	2025-06-03 10:33:21.939
6	╨Ь╨╛╨╗╨╛╨║╨╛	╨╗	60.000000000000000000000000000000	34.500000000000000000000000000000	2025-06-03 10:33:21.939
13	╨Ъ╤Г╤А╨╕╤Ж╨░	╨║╨│	180.000000000000000000000000000000	46.400000000000000000000000000000	2025-06-03 10:33:21.939
17	╨Ы╤Г╨║	╨║╨│	25.000000000000000000000000000000	59.400000000000000000000000000000	2025-06-03 10:33:21.939
24	╨У╤А╨╡╤З╨║╨░	╨║╨│	90.000000000000000000000000000000	78.800000000000000000000000000000	2025-06-03 10:33:21.939
26	╨е╨╗╨╡╨▒	╤И╤В	25.000000000000000000000000000000	198.400000000000000000000000000000	2025-06-03 10:33:21.939
28	╨Ъ╨╛╨╗╨▒╨░╤Б╨░	╨║╨│	350.000000000000000000000000000000	19.200000000000000000000000000000	2025-06-03 10:33:21.939
20	╨Я╨╛╨╝╨╕╨┤╨╛╤А╤Л	╨║╨│	100.000000000000000000000000000000	38.800000000000000000000000000000	2025-06-03 10:33:21.939
21	╨Ю╨│╤Г╤А╤Ж╤Л	╨║╨│	80.000000000000000000000000000000	48.800000000000000000000000000000	2025-06-03 10:33:21.939
\.


--
-- Data for Name: IngredientStopList; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IngredientStopList" (id, "ingredientId", "shiftId") FROM stdin;
\.


--
-- Data for Name: MenuIngredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MenuIngredient" (id, "menuItemId", "ingredientId", quantity) FROM stdin;
1	1	1	0.200000000000000000000000000000
2	1	6	0.300000000000000000000000000000
3	1	10	2.000000000000000000000000000000
4	1	3	0.005000000000000000000000000000
5	1	2	0.010000000000000000000000000000
6	1	4	0.020000000000000000000000000000
7	2	10	3.000000000000000000000000000000
8	2	6	0.100000000000000000000000000000
9	2	4	0.015000000000000000000000000000
10	2	3	0.003000000000000000000000000000
11	3	13	0.300000000000000000000000000000
12	3	15	0.200000000000000000000000000000
13	3	16	0.100000000000000000000000000000
14	3	17	0.050000000000000000000000000000
15	3	3	0.005000000000000000000000000000
16	3	19	0.050000000000000000000000000000
17	4	24	0.150000000000000000000000000000
18	4	4	0.015000000000000000000000000000
19	4	3	0.003000000000000000000000000000
20	5	26	0.200000000000000000000000000000
21	5	28	0.100000000000000000000000000000
22	5	16	0.050000000000000000000000000000
23	5	5	0.020000000000000000000000000000
24	5	3	0.003000000000000000000000000000
25	6	20	0.150000000000000000000000000000
26	6	21	0.150000000000000000000000000000
27	6	19	0.050000000000000000000000000000
28	6	16	0.030000000000000000000000000000
29	6	5	0.020000000000000000000000000000
30	6	3	0.002000000000000000000000000000
31	6	40	0.010000000000000000000000000000
32	7	1	0.250000000000000000000000000000
33	7	10	1.000000000000000000000000000000
34	7	3	0.003000000000000000000000000000
35	7	12	0.200000000000000000000000000000
36	7	16	0.050000000000000000000000000000
37	8	31	0.200000000000000000000000000000
38	8	16	0.050000000000000000000000000000
39	8	15	0.050000000000000000000000000000
40	8	4	0.015000000000000000000000000000
41	8	1	0.020000000000000000000000000000
42	8	7	0.100000000000000000000000000000
43	8	3	0.003000000000000000000000000000
44	8	18	0.005000000000000000000000000000
45	8	5	0.010000000000000000000000000000
46	9	9	0.200000000000000000000000000000
47	9	10	1.000000000000000000000000000000
48	9	1	0.050000000000000000000000000000
49	9	2	0.020000000000000000000000000000
50	9	3	0.002000000000000000000000000000
51	9	5	0.020000000000000000000000000000
52	10	12	0.250000000000000000000000000000
53	10	16	0.050000000000000000000000000000
54	10	1	0.020000000000000000000000000000
55	10	8	0.100000000000000000000000000000
56	10	4	0.015000000000000000000000000000
57	10	3	0.003000000000000000000000000000
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MenuItem" (id, name, description, price, "costPrice", "imageUrl", "isActive", "createdAt", "createdById") FROM stdin;
1	╨С╨╗╨╕╨╜╤Л	╨в╨╛╨╜╨║╨╕╨╡ ╨┐╤И╨╡╨╜╨╕╤З╨╜╤Л╨╡ ╨▒╨╗╨╕╨╜╤Л ╤Б ╨╝╨░╤Б╨╗╨╛╨╝	200.000000000000000000000000000000	100.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
2	╨Ю╨╝╨╗╨╡╤В	╨Т╨╛╨╖╨┤╤Г╤И╨╜╤Л╨╣ ╨╛╨╝╨╗╨╡╤В ╨╕╨╖ ╤П╨╕╤Ж ╤Б╨╛ ╤Б╨╗╨╕╨▓╨╛╤З╨╜╤Л╨╝ ╨╝╨░╤Б╨╗╨╛╨╝	150.000000000000000000000000000000	70.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
3	╨Ъ╤Г╤А╨╕╨╜╤Л╨╣ ╤Б╤Г╨┐	╨Э╨░╤Б╤Л╤Й╨╡╨╜╨╜╤Л╨╣ ╨▒╤Г╨╗╤М╨╛╨╜ ╤Б ╨║╤Г╤Б╨╛╤З╨║╨░╨╝╨╕ ╨║╤Г╤А╨╕╤Ж╤Л, ╨║╨░╤А╤В╨╛╤Д╨╡╨╗╨╡╨╝, ╨╝╨╛╤А╨║╨╛╨▓╤М╤О ╨╕ ╨╗╤Г╨║╨╛╨╝	300.000000000000000000000000000000	150.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
4	╨У╤А╨╡╤З╨╜╨╡╨▓╨░╤П ╨║╨░╤И╨░	╨У╤А╨╡╤З╨║╨░, ╤Б╨▓╨░╤А╨╡╨╜╨╜╨░╤П ╤Б ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╨╕╨╡╨╝ ╤Б╨╗╨╕╨▓╨╛╤З╨╜╨╛╨│╨╛ ╨╝╨░╤Б╨╗╨░ ╨╕ ╤Й╨╡╨┐╨╛╤В╨║╨╛╨╣ ╤Б╨╛╨╗╨╕	120.000000000000000000000000000000	60.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
5	╨Ь╨░╨║╨░╤А╨╛╨╜╤Л ╨┐╨╛-╤Д╨╗╨╛╤В╤Б╨║╨╕	╨Я╨░╤Б╤В╨░ ╤Б ╨╛╨▒╨╢╨░╤А╨╡╨╜╨╜╤Л╨╝╨╕ ╨╗╨╛╨╝╤В╨╕╨║╨░╨╝╨╕ ╨║╨╛╨╗╨▒╨░╤Б╤Л ╨╕ ╨╗╤Г╨║╨╛╨╝ ╨▓ ╤А╨░╤Б╤В╨╕╤В╨╡╨╗╤М╨╜╨╛╨╝ ╨╝╨░╤Б╨╗╨╡	250.000000000000000000000000000000	130.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
6	╨б╨░╨╗╨░╤В ╨╕╨╖ ╤Б╨▓╨╡╨╢╨╕╤Е ╨╛╨▓╨╛╤Й╨╡╨╣	╨б╨╝╨╡╤Б╤М ╨┐╨╛╨╝╨╕╨┤╨╛╤А╨╛╨▓, ╨╛╨│╤Г╤А╤Ж╨╛╨▓, ╨┐╨╡╤А╤Ж╨░ ╨╕ ╨╗╤Г╨║╨░ ╤Б ╨╛╨╗╨╕╨▓╨║╨╛╨▓╤Л╨╝ ╨╝╨░╤Б╨╗╨╛╨╝ ╨╕ ╨╖╨╡╨╗╨╡╨╜╤М╤О	180.000000000000000000000000000000	90.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
7	╨Я╨╡╨╗╤М╨╝╨╡╨╜╨╕	╨Ф╨╛╨╝╨░╤И╨╜╨╕╨╡ ╨┐╨╡╨╗╤М╨╝╨╡╨╜╨╕ ╤Б ╨│╨╛╨▓╤П╨┤╨╕╨╜╨╛╨╣ ╨╕ ╨╗╤Г╨║╨╛╨╝, ╨┐╨╛╨┤╨░╤О╤В╤Б╤П ╤Б╨╛ ╤Б╨╝╨╡╤В╨░╨╜╨╛╨╣	350.000000000000000000000000000000	180.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
8	╨У╤А╨╕╨▒╨╜╨╛╨╣ ╤Б╤Г╨┐	╨Ъ╤А╨╡╨╝-╤Б╤Г╨┐ ╨╕╨╖ ╤И╨░╨╝╨┐╨╕╨╜╤М╨╛╨╜╨╛╨▓ ╤Б ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╨╕╨╡╨╝ ╨╗╤Г╨║╨░, ╨╝╨╛╤А╨║╨╛╨▓╨╕ ╨╕ ╤Б╨╗╨╕╨▓╨╛╨║	320.000000000000000000000000000000	160.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
9	╨б╤Л╤А╨╜╨╕╨║╨╕	╨б╨╗╨░╨┤╨║╨╕╨╡ ╤В╨▓╨╛╤А╨╛╨╢╨╜╤Л╨╡ ╤Б╤Л╤А╨╜╨╕╨║╨╕ ╤Б ╤П╨╣╤Ж╨╛╨╝ ╨╕ ╨╝╤Г╨║╨╛╨╣, ╨╛╨▒╨╢╨░╤А╨╡╨╜╨╜╤Л╨╡ ╨╜╨░ ╤А╨░╤Б╤В╨╕╤В╨╡╨╗╤М╨╜╨╛╨╝ ╨╝╨░╤Б╨╗╨╡	220.000000000000000000000000000000	110.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
10	╨С╨╡╤Д╤Б╤В╤А╨╛╨│╨░╨╜╨╛╨▓	╨Э╨╡╨╢╨╜╤Л╨╡ ╨║╤Г╤Б╨╛╤З╨║╨╕ ╨│╨╛╨▓╤П╨┤╨╕╨╜╤Л ╨▓ ╤Б╨╛╤Г╤Б╨╡ ╨╕╨╖ ╤Б╨╝╨╡╤В╨░╨╜╤Л ╤Б ╨╗╤Г╨║╨╛╨╝ ╨╕ ╨╝╤Г╨║╨╛╨╣	400.000000000000000000000000000000	200.000000000000000000000000000000	\N	t	2025-06-03 10:43:38.143	d6023a90-5ed5-4783-a531-fae2b1f796f8
\.


--
-- Data for Name: MenuStopList; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MenuStopList" (id, "menuItemId", "shiftId") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "tableNumber", status, "totalPrice", "createdAt", "paidAt", "waiterId", "cashierId", "shiftId") FROM stdin;
9	1	OPEN	600.000000000000000000000000000000	2025-06-08 13:30:49.141	\N	2f3c44d0-1d1c-4fc4-9e5f-b6f36f5f81f0	\N	1
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "menuItemId", quantity, price) FROM stdin;
20	9	1	1	200.000000000000000000000000000000
21	9	10	1	400.000000000000000000000000000000
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", amount, "paymentType", "paidById", "paidAt") FROM stdin;
\.


--
-- Data for Name: Shift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shift" (id, "startedAt", "endedAt", "isActive", "managerId") FROM stdin;
1	2025-06-08 15:01:04.955	\N	t	136e45b9-05ea-4866-8e2d-b054464aef51
\.


--
-- Data for Name: ShiftStaff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftStaff" (id, "shiftId", "userId") FROM stdin;
1	1	2f3c44d0-1d1c-4fc4-9e5f-b6f36f5f81f0
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Supplier" (id, name, phone) FROM stdin;
1	Aibek Isakov	+996555123456
2	Aziza Karaeva	+996554987123
3	Nurlan Tursunov	+996777432190
4	Elvira Sadykova	+996502654321
5	Bekzat Mamatov	+996771234567
6	Gulnara Eshpayeva	+996505789012
7	Ermek Bekturov	+996775678901
8	Nazira Kasymova	+996556112233
9	Bakyt Mambetov	+996700445566
10	Aidai Orozbekova	+996777998877
11	Mirlan Aitmatov	+996555334455
12	Cholpon Zheenbekova	+996772221133
13	Omurbek Toktogulov	+996502998877
14	Aizhan Chynybekova	+996555776655
15	Talant Bakirov	+996775511223
16	Dinara Imanalieva	+996505443322
17	Ernst Otunbaev	+996771667788
18	Altynai Salieva	+996556778899
19	Rasul Baigaziev	+996700112233
20	Begimai Urazova	+996772334455
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "fullName", username, "passwordHash", role, "isActive", "createdAt") FROM stdin;
d6023a90-5ed5-4783-a531-fae2b1f796f8	Aibek Nurbekov	aibek.nurbekov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	ADMIN	t	2025-06-03 10:22:22.548
136e45b9-05ea-4866-8e2d-b054464aef51	Ermek Karamanov	ermek.karamanov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	MANAGER	t	2025-06-03 10:22:22.548
9af97c7d-b44d-4317-809e-af3773f34f20	Azamat Isakov	azamat.isakov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	MANAGER	t	2025-06-03 10:22:22.548
428ea6c4-a6ab-4f4a-8f92-9ac9590330f1	Bekzat Sadykov	bekzat.sadykov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	CASHIER	t	2025-06-03 10:22:22.548
6bcfaf5d-1bf4-47fd-9a85-2e724a74738d	Kanat Tursunov	kanat.tursunov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	CASHIER	t	2025-06-03 10:22:22.548
a77e89ec-d801-45ef-a2b6-1ed9ef4ebd8f	Nurlan Osmonov	nurlan.osmonov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	CASHIER	t	2025-06-03 10:22:22.548
0a720837-3ab3-4495-8f48-4a9700fa257c	Bakyt Mamatov	bakyt.mamatov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	CASHIER	t	2025-06-03 10:22:22.548
e8d0d175-ac99-480f-b314-f715b394be8e	Talant Bakirov	talant.bakirov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
6fbcd0a1-2cf6-4a1a-91d6-d1a8ea0cb934	Mirlan Aitmatov	mirlan.aitmatov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
c59282f4-161a-4cc3-ae44-0c49c7beea6d	Bekdoolot Zhumagulov	bekdoolot.zhumagulov	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
00ed9511-85bc-47a3-b9ea-0545dc3dc8a7	Ainura Abdrahmanova	ainura.abdrahmanova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
069cd1ce-4da5-445e-9ce1-b7da68db5596	Gulnara Bekbatyrova	gulnara.bekbatyrova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
0c4d20ed-1878-4114-933a-816eb87e9ad4	Aizhan Chynybekova	aizhan.chynybekova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
1c63f601-0594-4bcc-90d8-5b673b8a6283	Elvira Ergeshova	elvira.ergeshova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
c7497efc-307f-4257-a03a-d83ca6fd157e	Dinara Imanalieva	dinara.imanalieva	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
0867440e-e89e-422f-a259-64d78f1a5c55	Nazira Kadyrova	nazira.kadyrova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
c57e46a5-3aa7-4c0b-b24c-1e6a6d7fb08b	Aidai Omarova	aidai.omarova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
96b908fd-aee3-477d-9fbb-ff6d11795dc8	Altynai Salieva	altynai.salieva	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
e5a905de-81c1-4080-8632-eabec21d065f	Begimai Urazova	begimai.urazova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
3fdae137-8cea-4c8e-97c9-636f8cdcc0f4	Cholpon Zheenbekova	cholpon.zheenbekova	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-03 10:22:22.548
IT-5e3b5a4e-2c57-4d10-a3e2-f89b2a4dbd11	Ariet Amanbekov	Ariet	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	MANAGER	t	2025-06-03 10:22:22.548
2f3c44d0-1d1c-4fc4-9e5f-b6f36f5f81f0	Ali Almazbekov	alishka	$2b$10$bCm/8g/8gAc1aDvxxn5m3uiu91shpOkXT3Ufp4eGsWETEZ3LniL0S	WAITER	t	2025-06-08 15:01:04.955
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0677d7e6-601f-49d5-8ce9-5ac10b02285c	05e7fd353278cfd916821c3eb9f19c080236e56082ff253aa2faf5622835e719	2025-06-02 22:15:09.640549+05	20250602171509_init	\N	\N	2025-06-02 22:15:09.533545+05	1
\.


--
-- Name: Delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Delivery_id_seq"', 1, false);


--
-- Name: IngredientStopList_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."IngredientStopList_id_seq"', 5, true);


--
-- Name: Ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ingredient_id_seq"', 40, true);


--
-- Name: MenuIngredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MenuIngredient_id_seq"', 57, true);


--
-- Name: MenuItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MenuItem_id_seq"', 10, true);


--
-- Name: MenuStopList_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MenuStopList_id_seq"', 31, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 21, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 9, true);


--
-- Name: Payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payment_id_seq"', 1, false);


--
-- Name: ShiftStaff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ShiftStaff_id_seq"', 1, true);


--
-- Name: Shift_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Shift_id_seq"', 1, true);


--
-- Name: Supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Supplier_id_seq"', 20, true);


--
-- Name: Delivery Delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_pkey" PRIMARY KEY (id);


--
-- Name: IngredientStopList IngredientStopList_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IngredientStopList"
    ADD CONSTRAINT "IngredientStopList_pkey" PRIMARY KEY (id);


--
-- Name: Ingredient Ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY (id);


--
-- Name: MenuIngredient MenuIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuIngredient"
    ADD CONSTRAINT "MenuIngredient_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: MenuStopList MenuStopList_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuStopList"
    ADD CONSTRAINT "MenuStopList_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ShiftStaff ShiftStaff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftStaff"
    ADD CONSTRAINT "ShiftStaff_pkey" PRIMARY KEY (id);


--
-- Name: Shift Shift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Delivery Delivery_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Delivery Delivery_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Delivery Delivery_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientStopList IngredientStopList_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IngredientStopList"
    ADD CONSTRAINT "IngredientStopList_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IngredientStopList IngredientStopList_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IngredientStopList"
    ADD CONSTRAINT "IngredientStopList_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuIngredient MenuIngredient_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuIngredient"
    ADD CONSTRAINT "MenuIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuIngredient MenuIngredient_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuIngredient"
    ADD CONSTRAINT "MenuIngredient_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuStopList MenuStopList_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuStopList"
    ADD CONSTRAINT "MenuStopList_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuStopList MenuStopList_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuStopList"
    ADD CONSTRAINT "MenuStopList_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_waiterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_paidById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShiftStaff ShiftStaff_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftStaff"
    ADD CONSTRAINT "ShiftStaff_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShiftStaff ShiftStaff_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftStaff"
    ADD CONSTRAINT "ShiftStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shift Shift_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

