--
-- PostgreSQL database dump
--

\restrict XM9ms7SOdbRViAYnitav4gHhJp8Gv5yqJgwhpx04KXxfhwSTxgWOqxeBhIQVK8m

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-04-29 22:37:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 222 (class 1255 OID 16464)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16415)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    date timestamp without time zone NOT NULL,
    location character varying(255),
    venue character varying(255),
    category character varying(100),
    max_participants integer DEFAULT 100,
    registered_count integer DEFAULT 0,
    created_by integer,
    organizing_club character varying(255),
    sa_vertical character varying(100),
    fees character varying(50) DEFAULT 'Free'::character varying,
    contact character varying(50),
    online_link text,
    status character varying(50) DEFAULT 'Active'::character varying,
    tags text[],
    key_features text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    campus character varying(100),
    organising_club character varying(255),
    event_type character varying(100),
    day character varying(20),
    capacity integer DEFAULT 100,
    current_registrations integer DEFAULT 0,
    time_from time without time zone,
    time_to time without time zone,
    target_audience character varying(255),
    department character varying(100),
    image_url text,
    contact_number character varying(20),
    expected_count integer,
    total_seats integer,
    seats integer,
    contact_no character varying(20),
    volunteer_count integer DEFAULT 0,
    is_open_to_non_vit boolean DEFAULT false,
    allow_external boolean DEFAULT false,
    payment_qr_url text,
    faculty_id integer,
    is_approved boolean DEFAULT false,
    approved_at timestamp without time zone,
    organizing_dept character varying(100),
    special_guest text,
    amenities jsonb DEFAULT '[]'::jsonb,
    created_by_role character varying(20) DEFAULT 'faculty'::character varying,
    created_by_id integer,
    approval_notes text,
    remarks text,
    event_poster_url text,
    event_ppt_url text,
    terms_conditions text,
    photos jsonb DEFAULT '[]'::jsonb,
    is_closed boolean DEFAULT false,
    coordinator_remarks text,
    resubmission_count integer DEFAULT 0,
    poster_url text,
    ppt_url text,
    terms_url text,
    coordinator_id integer
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16400)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'student'::character varying,
    points integer DEFAULT 0,
    branch character varying(100),
    year character varying(20),
    roll_no character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    first_name character varying(255),
    last_name character varying(255),
    gr_number character varying(50),
    designation character varying(100),
    department character varying(100),
    division character varying(50),
    campus character varying(100),
    phone character varying(20),
    interests jsonb,
    assigned_role character varying(50),
    promoted_by integer,
    promotion_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bio text,
    profile_pic_url text,
    organising_club character varying(255),
    assigned_event_id integer,
    college_type character varying(20) DEFAULT 'vitian'::character varying,
    college_name character varying(255),
    college_email character varying(255),
    is_approved boolean DEFAULT true,
    coordinator_type character varying(20) DEFAULT 'none'::character varying,
    club_name character varying(100) DEFAULT NULL::character varying,
    CONSTRAINT users_college_type_check CHECK (((college_type)::text = ANY ((ARRAY['vitian'::character varying, 'non_vitian'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'faculty'::character varying, 'hod'::character varying, 'dean'::character varying, 'club_president'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 216
-- Name: COLUMN users.coordinator_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.coordinator_type IS 'Managed by the Dean to delegate approvals';


--
-- TOC entry 221 (class 1259 OID 24689)
-- Name: coordinator_pending_events; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.coordinator_pending_events AS
 SELECT e.id,
    e.title,
    e.description,
    e.date,
    e.location,
    e.venue,
    e.category,
    e.max_participants,
    e.registered_count,
    e.created_by,
    e.organizing_club,
    e.sa_vertical,
    e.fees,
    e.contact,
    e.online_link,
    e.status,
    e.tags,
    e.key_features,
    e.created_at,
    e.updated_at,
    e.campus,
    e.organising_club,
    e.event_type,
    e.day,
    e.capacity,
    e.current_registrations,
    e.time_from,
    e.time_to,
    e.target_audience,
    e.department,
    e.image_url,
    e.contact_number,
    e.expected_count,
    e.total_seats,
    e.seats,
    e.contact_no,
    e.volunteer_count,
    e.is_open_to_non_vit,
    e.allow_external,
    e.payment_qr_url,
    e.faculty_id,
    e.is_approved,
    e.approved_at,
    e.organizing_dept,
    e.special_guest,
    e.amenities,
    e.created_by_role,
    e.created_by_id,
    e.approval_notes,
    u.first_name,
    u.last_name,
    u.email
   FROM (public.events e
     LEFT JOIN public.users u ON ((e.faculty_id = u.id)))
  WHERE ((e.status)::text = 'pending'::text)
  ORDER BY e.created_at DESC;


ALTER VIEW public.coordinator_pending_events OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16414)
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 217
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- TOC entry 220 (class 1259 OID 16435)
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    status character varying(50) DEFAULT 'confirmed'::character varying,
    attended boolean DEFAULT false,
    certificate_issued boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    registration_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    registration_status character varying(50) DEFAULT 'confirmed'::character varying,
    reg_name character varying(255),
    reg_department character varying(100),
    reg_division character varying(50),
    reg_year character varying(20),
    reg_gr_number character varying(50),
    reg_prn character varying(50),
    reg_phone character varying(20),
    reg_college_name character varying(255),
    receipt_url text,
    is_verified boolean DEFAULT false,
    receipt_image_url text,
    verification_status character varying(20) DEFAULT 'pending'::character varying,
    attendance_marked boolean DEFAULT false
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16434)
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registrations_id_seq OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 219
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- TOC entry 215 (class 1259 OID 16399)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4760 (class 2604 OID 16418)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 16438)
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 16403)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4974 (class 0 OID 16415)
-- Dependencies: 218
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, description, date, location, venue, category, max_participants, registered_count, created_by, organizing_club, sa_vertical, fees, contact, online_link, status, tags, key_features, created_at, updated_at, campus, organising_club, event_type, day, capacity, current_registrations, time_from, time_to, target_audience, department, image_url, contact_number, expected_count, total_seats, seats, contact_no, volunteer_count, is_open_to_non_vit, allow_external, payment_qr_url, faculty_id, is_approved, approved_at, organizing_dept, special_guest, amenities, created_by_role, created_by_id, approval_notes, remarks, event_poster_url, event_ppt_url, terms_conditions, photos, is_closed, coordinator_remarks, resubmission_count, poster_url, ppt_url, terms_url, coordinator_id) FROM stdin;
17	MAD CP	Course Project	2026-04-28 00:00:00	\N	1316D	Technical	100	0	\N	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-27 22:40:15.53639	2026-04-27 22:41:13.601935	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	78	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
18	MAD CP	Course Project	2026-04-28 00:00:00	\N	1316 D	Technical	100	0	\N	\N	\N	Free	\N	\N	approved	\N	[]	2026-04-27 22:45:53.871894	2026-04-27 22:50:22.331765	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	79	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
19	Mobile App Development	Interesting	2026-04-29 00:00:00	\N	1316 D	Technical	100	0	\N	\N	\N	Free	\N	\N	approved	\N	[]	2026-04-27 22:50:12.065138	2026-04-27 22:50:24.335885	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	79	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
20	Study	Informative	2026-04-29 00:00:00	\N	Audi	Seminar	100	0	\N	\N	\N	90	\N	\N	rejected	\N	[]	2026-04-27 22:55:59.348046	2026-04-27 22:56:17.207066	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	Computer Science	\N	\N	0	\N	60	\N	0	f	f	\N	6	f	\N	\N	Gate Smashers	["Certificates/Gifts", "Food/Refreshments"]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
21	Study	Informative	2026-04-30 00:00:00	\N	Audi	Seminar	100	0	\N	\N	\N	100	\N	\N	approved	\N	[]	2026-04-27 22:59:02.825719	2026-04-27 22:59:17.476585	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	Computer Science	\N	\N	0	\N	89	\N	0	f	f	\N	6	f	\N	\N	Gate Smashers	["Food/Refreshments", "Certificates/Gifts"]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
22	fg45678fgh ,.,/	\N	2026-04-28 00:00:00	\N	er435, 657, b97, 567	Sports	100	0	\N	\N	\N	0	\N	\N	approved	\N	[]	2026-04-28 12:33:17.040834	2026-04-28 12:33:56.190112	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	Computer Engineering	\N	\N	0	\N	-456	\N	0	f	t	\N	6	f	\N	\N	\N	\N	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
2	Tech Talk: AI & Future	Industry experts discussing the future of AI and machine learning.	2025-04-02 11:00:00	Seminar Hall A	\N	Seminar	80	67	2	CSE Department	Technical	Free	9876543211	\N	Active	{ai,"machine learning",technology}	{"Industry Experts","Q&A Session",Certificate}	2026-03-07 18:23:02.774847	2026-04-28 18:06:58.622621	\N	\N	\N	\N	100	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	f	f	\N	2	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
3	Cultural Fest 2025	Annual cultural festival featuring dance, music, drama, and food stalls.	2025-04-20 10:00:00	Open Air Theatre	\N	Cultural	400	310	2	Cultural Club	Cultural	â‚¹50	9876543213	\N	Active	{cultural,entertainment,festival}	{Dance,Music,Drama,"Food Stalls"}	2026-03-07 18:23:02.774847	2026-04-28 18:06:58.622621	\N	\N	\N	\N	100	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	f	f	\N	2	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
9	Hackathom	Innovative	2026-03-13 00:00:00	\N	Audi	Hackathon	100	0	6	\N	Technical	Free	123456890	\N	approved	\N	["Cash"]	2026-03-12 15:24:41.24764	2026-04-28 18:06:58.622621	\N	CSE	Hackathon	\N	100	0	15:23:00	18:25:00	All	\N	https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800	123456890	120	\N	199	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
4	g	fun	2026-03-21 00:00:00	\N	f	Cultural	100	0	6	\N	Cultural	Free	1234567890	\N	approved	\N	["cash"]	2026-03-08 20:48:54.234015	2026-04-28 18:06:58.622621	\N	f	Cultural	\N	100	0	20:48:00	21:49:00	d	\N	\N	1234567890	12	\N	20	\N	0	t	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
5	Hackathon	Innovative	2026-03-11 00:00:00	\N	Auditorium	Hackathon	100	0	6	\N	Technical	Free	1234567890	\N	approved	\N	["Certificates"]	2026-03-09 14:02:59.014793	2026-04-28 18:06:58.622621	\N	CSE	Hackathon	\N	100	0	16:01:00	16:04:00	All Branches	\N	\N	1234567890	118	\N	200	\N	0	t	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
6	Dance Workshop	Fun Event	2026-03-12 00:00:00	\N	-2	Workshop	100	0	6	\N	Cultural	Free	1234567890	\N	approved	\N	["Certificates"]	2026-03-11 20:16:50.217348	2026-04-28 18:06:58.622621	\N	Zephyr	Workshop	\N	100	0	21:15:00	22:15:00	All Branches	\N	\N	1234567890	120	\N	179	\N	0	t	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
8	B	Add	2026-03-11 00:00:00	\N	Audi	Seminar	100	0	6	\N	NCC	Free	1234567890	\N	approved	\N	["Cash Prizes"]	2026-03-11 22:29:24.415839	2026-04-28 18:06:58.622621	\N	a	National	\N	100	0	00:30:00	01:32:00	All Branches	\N	https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800	1234567890	120	\N	199	\N	0	t	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
7	Cricket	Athletic	2026-03-13 00:00:00	\N	Ground	Sports	100	0	6	\N	Sports	Free	1234567890	\N	approved	\N	["Certificates"]	2026-03-11 20:40:10.59015	2026-04-28 18:06:58.622621	\N	CSE	Sports	\N	100	0	08:40:00	10:00:00	All Branches	\N	https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800	1234567890	22	\N	44	\N	0	t	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
1	National Hackathon 2025	A 24-hour coding marathon with industry mentors and exciting prizes.	2025-03-15 09:00:00	Main Auditorium	\N	Hackathon	120	89	2	CSE Department	Technical	Free	9876543210	\N	Active	{coding,technology,competition}	{"24 Hour Coding","Cash Prizes","Industry Mentors"}	2026-03-07 18:23:02.774847	2026-04-28 18:06:58.622621	\N	\N	\N	\N	100	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	f	\N	2	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
15	Relay Race	Athletic	2026-04-15 00:00:00	\N	ground	Sports	100	0	6	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-13 00:17:15.100239	2026-04-28 18:06:58.622621	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	99	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
14	Relay Race	Athletic	2026-04-15 00:00:00	\N	Ground	Sports	100	0	6	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-13 00:11:11.216768	2026-04-28 18:06:58.622621	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	129	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
13	Relay Race	Athletic	2026-04-15 00:00:00	\N	Ground	Sports	100	0	6	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-13 00:11:07.145731	2026-04-28 18:06:58.622621	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	129	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
12	relay race	Athletic	2026-04-15 00:00:00	\N	Ground	Sports	100	0	6	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-13 00:04:55.726096	2026-04-28 18:06:58.622621	\N	\N	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	100	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
11	relay race	Athletic	2026-04-15 00:00:00	\N	Ground	Sports	100	0	6	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-13 00:04:52.862019	2026-04-28 18:06:58.622621	\N	\N	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	100	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
10	relay race	Athletic	2026-04-15 00:00:00	\N	Ground	Sports	100	0	6	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-13 00:04:46.843975	2026-04-28 18:06:58.622621	\N	\N	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	100	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
16	Relay Race	Athletic	2026-04-15 00:00:00	\N	ground	Sports	100	0	6	\N	\N	Free	\N	\N	approved	\N	[]	2026-04-13 00:18:34.683295	2026-04-28 18:06:58.622621	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	99	\N	0	f	f	\N	6	f	\N	\N	\N	[]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
23	Cloud Computing Workshop	H	2026-04-30 00:00:00	\N	A-105	Technical	100	0	\N	\N	\N	0	\N	\N	rejected	\N	[]	2026-04-29 12:35:38.076885	2026-04-29 12:48:35.203654	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	Computer Science	\N	\N	0	\N	30	\N	0	f	f	\N	6	f	\N	\N	Dr	["Food/Refreshments"]	faculty	\N	\N	\N	\N	\N	\N	[]	f	Not detailed enough	0	\N	\N	\N	6
24	Hk	g	2026-05-01 00:00:00	\N	1022	Seminar	100	0	\N	\N	\N	0	\N	\N	pending	\N	[]	2026-04-29 12:51:32.592869	2026-04-29 12:51:32.592869	\N	Faculty Department	Department	\N	100	0	\N	\N	All	Computer Science	\N	\N	0	\N	30	\N	0	f	f	\N	6	f	\N	\N	dr	["Food/Refreshments"]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
25	hj	gb	2026-05-08 00:00:00	\N	1234	Technical	100	0	\N	\N	\N	0	\N	\N	approved	\N	[]	2026-04-29 12:52:02.949342	2026-04-29 12:52:05.950465	\N	Faculty Department	Intracollege	\N	100	0	\N	\N	All	Computer Science	\N	\N	0	\N	20	\N	0	f	f	\N	6	f	\N	\N	dr	["Food/Refreshments"]	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	6
26	bh	f	2026-05-08 00:00:00	\N	12	Technical	100	0	\N	\N	\N	0	\N	\N	rejected	\N	[]	2026-04-29 12:53:18.417318	2026-04-29 12:53:30.942213	\N	Faculty Department	National	\N	100	0	\N	\N	All	Information Technology	\N	\N	0	\N	3	\N	0	f	f	\N	6	f	\N	\N	dr	["Food/Refreshments"]	faculty	\N	\N	\N	\N	\N	\N	[]	f	not interesting	0	\N	\N	\N	6
27	Resonance	Fun	2026-05-02 00:00:00	\N	1234D	Technical	100	0	\N	\N	\N	Free	\N	\N	approved	\N	[]	2026-04-29 22:21:24.622602	2026-04-29 22:22:00.548053	\N	\N	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	100	\N	0	f	f	\N	31	f	\N	\N	\N	\N	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	6
28	Resonance Paid	Amazing	2026-05-05 00:00:00	\N	1245F	Sports	100	0	\N	\N	\N	Free	\N	\N	pending	\N	[]	2026-04-29 22:24:09.762015	2026-04-29 22:24:09.762015	\N	\N	Intercollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	100	\N	0	f	f	\N	31	f	\N	\N	\N	\N	faculty	\N	\N	\N	\N	\N	\N	[]	f	\N	0	\N	\N	\N	\N
29	Resonance Paid	Amazing	2026-05-08 00:00:00	\N	1236D	Technical	100	0	\N	\N	\N	Free	\N	\N	rejected	\N	[]	2026-04-29 22:24:59.810672	2026-04-29 22:25:41.858021	\N	\N	Intracollege	\N	100	0	\N	\N	All	\N	\N	\N	0	\N	100	\N	0	f	f	\N	31	f	\N	\N	\N	\N	faculty	\N	\N	\N	\N	\N	\N	[]	f	Take fees for this event	0	\N	\N	\N	6
\.


--
-- TOC entry 4976 (class 0 OID 16435)
-- Dependencies: 220
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, user_id, event_id, status, attended, certificate_issued, created_at, registered_at, registration_date, registration_status, reg_name, reg_department, reg_division, reg_year, reg_gr_number, reg_prn, reg_phone, reg_college_name, receipt_url, is_verified, receipt_image_url, verification_status, attendance_marked) FROM stdin;
1	1	1	confirmed	f	f	2026-03-07 18:23:02.783777	2026-03-08 18:27:53.410409	2026-03-08 18:47:28.987448	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
2	1	2	confirmed	f	f	2026-03-07 18:23:02.783777	2026-03-08 18:27:53.410409	2026-03-08 18:47:28.987448	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
3	15	4	confirmed	f	f	2026-03-08 22:38:12.916537	2026-03-08 22:38:12.916537	2026-03-08 22:38:12.916537	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
4	15	1	confirmed	f	f	2026-03-09 10:37:00.322705	2026-03-09 10:37:00.322705	2026-03-09 10:37:00.322705	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
5	15	2	confirmed	f	f	2026-03-09 13:59:31.000268	2026-03-09 13:59:31.000268	2026-03-09 13:59:31.000268	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
6	15	6	confirmed	f	f	2026-03-11 20:32:06.963017	2026-03-11 20:32:06.963017	2026-03-11 20:32:06.963017	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
7	27	6	confirmed	f	f	2026-03-12 10:55:41.76708	2026-03-12 10:55:41.76708	2026-03-12 10:55:41.76708	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
8	27	8	confirmed	f	f	2026-03-12 10:55:47.465797	2026-03-12 10:55:47.465797	2026-03-12 10:55:47.465797	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
9	27	7	confirmed	f	f	2026-03-12 10:55:47.906457	2026-03-12 10:55:47.906457	2026-03-12 10:55:47.906457	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
10	15	8	confirmed	f	f	2026-03-12 10:56:08.01867	2026-03-12 10:56:08.01867	2026-03-12 10:56:08.01867	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
11	15	7	confirmed	f	f	2026-03-12 10:56:10.733059	2026-03-12 10:56:10.733059	2026-03-12 10:56:10.733059	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
12	15	5	confirmed	f	f	2026-03-12 11:03:41.252075	2026-03-12 11:03:41.252075	2026-03-12 11:03:41.252075	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
13	27	4	confirmed	f	f	2026-03-12 11:04:08.551891	2026-03-12 11:04:08.551891	2026-03-12 11:04:08.551891	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
14	27	5	confirmed	f	f	2026-03-12 11:04:11.191896	2026-03-12 11:04:11.191896	2026-03-12 11:04:11.191896	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
15	27	1	confirmed	f	f	2026-03-12 11:04:14.622092	2026-03-12 11:04:14.622092	2026-03-12 11:04:14.622092	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
16	15	3	confirmed	f	f	2026-03-12 11:09:01.753454	2026-03-12 11:09:01.753454	2026-03-12 11:09:01.753454	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
17	15	9	confirmed	f	f	2026-04-05 23:25:38.769612	2026-04-05 23:25:38.769612	2026-04-05 23:25:38.769612	confirmed	Neha Patil	IT	\N	2nd Year	7	\N	8	\N	\N	f	\N	pending	f
18	9	8	confirmed	f	f	2026-04-13 00:09:56.58321	2026-04-13 00:09:56.58321	2026-04-13 00:09:56.58321	confirmed	Tejal Jadhav	Computer Engineering	S	2nd Year	12413	\N	1234567890	\N	\N	f	\N	pending	f
19	15	16	confirmed	f	f	2026-04-13 00:20:09.390291	2026-04-13 00:20:09.390291	2026-04-13 00:20:09.390291	confirmed	Neha Patil	IT	J	2nd Year	12413588	\N	1234567890	\N	\N	f	\N	pending	f
20	30	16	confirmed	f	f	2026-04-26 18:46:33.906756	2026-04-26 18:46:33.906756	2026-04-26 18:46:33.906756	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
21	30	9	confirmed	f	f	2026-04-26 18:47:42.555291	2026-04-26 18:47:42.555291	2026-04-26 18:47:42.555291	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
22	30	8	confirmed	f	f	2026-04-26 18:48:33.438945	2026-04-26 18:48:33.438945	2026-04-26 18:48:33.438945	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
23	30	7	confirmed	f	f	2026-04-26 18:48:39.224371	2026-04-26 18:48:39.224371	2026-04-26 18:48:39.224371	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
24	30	6	confirmed	f	f	2026-04-27 22:31:43.554029	2026-04-27 22:31:43.554029	2026-04-27 22:31:43.554029	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
25	15	21	confirmed	f	f	2026-04-27 23:07:23.117825	2026-04-27 23:07:23.117825	2026-04-27 23:07:23.117825	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
26	15	19	confirmed	f	f	2026-04-28 12:10:13.365514	2026-04-28 12:10:13.365514	2026-04-28 12:10:13.365514	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
27	15	25	confirmed	f	f	2026-04-29 12:52:36.493397	2026-04-29 12:52:36.493397	2026-04-29 12:52:36.493397	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
28	15	27	confirmed	f	f	2026-04-29 22:23:04.772021	2026-04-29 22:23:04.772021	2026-04-29 22:23:04.772021	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	verified	f
29	31	29	confirmed	f	f	2026-04-29 22:27:20.736572	2026-04-29 22:27:20.736572	2026-04-29 22:27:20.736572	confirmed	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	pending	f
\.


--
-- TOC entry 4972 (class 0 OID 16400)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, points, branch, year, roll_no, created_at, updated_at, first_name, last_name, gr_number, designation, department, division, campus, phone, interests, assigned_role, promoted_by, promotion_date, bio, profile_pic_url, organising_club, assigned_event_id, college_type, college_name, college_email, is_approved, coordinator_type, club_name) FROM stdin;
6	\N	v.a@vit.edu	$2b$10$jUys.gk53wzu0q450QnEzeyFoe.eg/9H9Q2BOVnVKrbQc6ME9xwCu	faculty	0	\N		\N	2026-03-08 10:52:53.013179	2026-04-29 12:34:06.845078	v	a	12413577	Professor	Computer Engineering		Bibwewadi		[]	\N	\N	2026-03-08 11:11:48.617464	\N	\N	\N	\N	vitian	\N	\N	t	Technical	\N
1	Tejal Jadhav	tejal@vit.edu	$2a$10$example.hash	student	1240	BTech-Computer Engineering	3rd Year	VIT2023CSE045	2026-03-07 18:23:02.768251	2026-03-12 11:11:34.215674	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-08 11:11:48.617464	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
5	\N	vedant.patkar241@vit.edu	$2b$10$ek2SwfVcXW8A90qlGk0TSOJWiE8lsWT2SnPAOGaoTa1HDqkglPgjS	dean	0	\N	2nd Year	\N	2026-03-07 18:44:48.732334	2026-03-12 11:11:34.215674	Vedant	Patkar	12413588	Dean	Computer Engineering	B	Bibwewadi	+91 1234567890	["Hackathons", "Workshops", "Robotics"]	\N	\N	2026-03-08 11:11:48.617464	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
28	\N	ramesh@vit.edu	$2b$10$vLvMnHtrUZv41MgUMsYRVOoBMzaijlt2yKUt0A414V6BpJnMY6MI.	student	0	\N	4th Year	\N	2026-03-12 09:45:43.096604	2026-03-12 11:11:34.215674	Ramesh	Pawar	1234678		Chemical Engineering	E	Bibwewadi	ramesh@vit.edu	["Robotics", "Seminars"]	\N	\N	2026-03-12 09:45:43.096604	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
20	\N	karan.j@vit.edu	$2b$10$rnVVOn6Wgar.7TCCq8AK.O3jHGNnTZm3eKZLnf7RDhAuv8ZzPlssm	student	0	\N	\N	\N	2026-03-08 22:28:02.142595	2026-03-12 11:11:34.215674	Karan	Joshi	\N	\N	IT	\N	\N	\N	\N	\N	\N	2026-03-08 22:28:02.142595	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
22	\N	vikram.s@vit.edu	$2b$10$L6DKI5asKPpX0xURZsiU7OPaW2IRuLDwFyiSJBbKIX4aDlW9UZcvO	student	0	\N	\N	\N	2026-03-08 22:28:02.427878	2026-03-12 11:11:34.215674	Vikram	Singh	\N	\N	Mechanical	\N	\N	\N	\N	\N	\N	2026-03-08 22:28:02.427878	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
23	\N	snehal.r@vit.edu	$2b$10$/oaeQTsHYQ/qaaA0a4icZ.KQpAIxGPpw62XdcTEi4ih6U7K9prIdm	student	0	\N	\N	\N	2026-03-08 22:28:02.57624	2026-03-12 11:11:34.215674	Snehal	Rane	\N	\N	ENTC	\N	\N	\N	\N	\N	\N	2026-03-08 22:28:02.57624	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
15	\N	neha.p@vit.edu	$2b$10$5i15mT8rGQTJwUtv7Z2pierOEd7m5xj.1VfCCswDa5SyK81NZvU/e	student	0	\N	SE	\N	2026-03-08 22:28:01.362764	2026-03-12 11:11:34.215674	Neha	Patil	\N	\N	IT	\N	\N	+91 8446094203	[]	\N	\N	2026-03-08 22:28:01.362764	Hii	\N	\N	\N	vitian	\N	\N	t	none	\N
24	\N	suresh.verma@vit.edu	$2b$10$loY2wnA/3TbjdEmGEfILEeq0sOPnB7w9YaASJk27AD9Xl2oL132nS	student	0	\N	\N	\N	2026-03-09 10:46:23.015877	2026-03-12 11:11:34.215674	Suresh	Verma	21CSE001	\N	CSE	\N	\N	\N	\N	\N	\N	2026-03-09 10:46:23.015877	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
25	\N	ramesh.rajpurohit@vit.edu	$2b$10$ANCwWmPzPXlzJcqV4YbsWerCfRHpMqAkv83SyK8nICS3UAkO6OeEC	student	0	\N	\N	\N	2026-03-09 10:46:23.23107	2026-03-12 11:11:34.215674	Ramesh	Rajpurohit	21IT045	\N	IT	\N	\N	\N	\N	\N	\N	2026-03-09 10:46:23.23107	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
26	\N	vainteya.patole@vit.edu	$2b$10$EWpySZlDMjBp5zhGIuVIBeSIek9WA.0nohDdst/71G914GLelvWLm	student	0	\N	\N	\N	2026-03-09 10:46:23.446306	2026-03-12 11:11:34.215674	Vainteya	Patole	21CSE023	\N	CSE	\N	\N	\N	\N	\N	\N	2026-03-09 10:46:23.446306	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
14	\N	amit.s@vit.edu	$2b$10$9OmiW1iyy4MOr557Th5V2u2nE8V7LqAKRfLJEyLJYnRJ0Zev4dBUS	student	0	\N	\N	\N	2026-03-08 22:28:01.20459	2026-03-12 11:11:34.215674	Amit	Sharma	\N	\N	CSE	\N	\N	\N	\N	coordinator	5	2026-03-08 22:28:01.20459	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
19	\N	anjali.v@vit.edu	$2b$10$8k1cwkdLqwgVovtq1nkP3ORUGqU6/2AFQJ1PcFVLhJjB/fksJSlzi	student	0	\N	\N	\N	2026-03-08 22:28:01.996468	2026-03-12 11:11:34.215674	Anjali	Varma	\N	\N	Civil	\N	\N	\N	\N	volunteer	5	2026-03-08 22:28:01.996468	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
21	\N	isha.g@vit.edu	$2b$10$SCNePs51x7ro1NdvJ7rgrugol7oZVpAOANefu3Oz9JGl7UCV.LwTK	student	0	\N	\N	\N	2026-03-08 22:28:02.286793	2026-03-12 11:11:34.215674	Isha	Gupta	\N	\N	CSE	\N	\N	\N	\N	volunteer	5	2026-03-08 22:28:02.286793	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
27	\N	aayushsharma@gmail.com	$2b$10$VStJyXOqZq7GEcrwSIwmxOsR7ZYAK./pUvgMMnlY6i4uwyWUrMY/q	student	0	\N	3rd Year	\N	2026-03-12 09:40:37.003842	2026-03-12 11:11:34.215674	Aayush	Sharma	\N	\N	Mechanical	\N	\N	1234567890	["Hackathons", "Music", "Workshops"]	\N	\N	2026-03-12 09:40:37.003842	\N	\N	\N	\N	non_vitian	MIT 	\N	t	none	\N
2	Rahul Coordinator	rahul@vit.edu	$2a$10$example.hash	student	0	CSE Department	Faculty	FAC001	2026-03-07 18:23:02.768251	2026-04-28 18:04:31.591395	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-08 11:11:48.617464	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
3	Admin User	admin@vit.edu	$2a$10$example.hash	dean	0	All	Admin	ADMIN001	2026-03-07 18:23:02.768251	2026-04-28 18:04:31.591395	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-08 11:11:48.617464	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
7	\N	g.h@vit.edu	$2b$10$LHNE/YKgcBje.EDxhyawW.fbb0wxUBe7BKwbjywG/zfBtX//yq2vm	faculty	0	\N		\N	2026-03-08 10:57:08.816581	2026-04-28 18:09:33.630028	g	h	149505	Dean	Computer Engineering		Bibwewadi		[]	\N	\N	2026-03-08 11:11:48.617464	\N	\N	\N	\N	vitian	\N	\N	t	\N	\N
8	\N	y.u@vit.edu	$2b$10$EDHz3Jn3/WI/cgTK0b9dlOqsriBwlfSEOCt5DJC.KvspZSQ3503Em	faculty	0	\N		\N	2026-03-08 12:40:07.5189	2026-04-29 12:18:26.097055	Y	U	1234	Professor	Computer Engineering		Bibwewadi		[]	\N	\N	2026-03-08 12:40:07.5189	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
10	\N	sujal.patil@vit.edu	$2b$10$oCP3O13MWe7b0KSHeTOJNudHQcBnhNbOjC8z8iZngeidEU2qtdC.G	student	0	\N	2nd Year	\N	2026-03-08 18:09:28.247464	2026-03-12 11:11:34.215674	Sujal	Patil	1241234		IT	C	Bibwewadi		["Workshops", "Robotics", "Networking", "Photography"]	volunteer	\N	2026-03-08 18:09:28.247464	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
13	\N	test@vit.edu	$2b$10$sagCd2h3UVyS4Ul3eEzSOuboFEM7sW0iBgE4T5RiaRqRhbXgzATPy	student	0	\N	SE	\N	2026-03-08 19:46:57.217548	2026-03-12 11:11:34.215674	Test	User	\N	\N	CSE	\N	\N		[]	\N	\N	2026-03-08 19:46:57.217548		\N	\N	\N	vitian	\N	\N	t	none	\N
29	\N	test123@vit.edu	$2b$10$a/Y0sy3N8KPPxLvQMgoQle0Vgy1UyblUIG1CskWvKFkySWdq.5X8y	hod	0	\N		\N	2026-04-26 18:42:52.138957	2026-04-26 18:42:52.138957	Test	123		HOD	Computer Engineering		Bibwewadi	1234567890	[]	\N	\N	2026-04-26 18:42:52.138957	Head of Department of Computer Engineering	\N	\N	\N	vitian	\N	\N	t	none	\N
31	\N	test5@vit.edu	$2b$10$EqoiaDKPw0jorPlOBweqt.9Ny0TnsM1xvwrQ1ch/QgkW.V7Cd1Nsa	club_president	0	\N	TY	\N	2026-04-29 22:03:30.202656	2026-04-29 22:09:03.75447	XYZ	ABC	12456789		Mechanical Engineering	C	Bibwewadi	467754544	[]	\N	\N	2026-04-29 22:03:30.202656	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
11	\N	a@vit.edu	$2b$10$PJuNndOmgIvLQLKhwWgsBupdIVqHX/e8MX.q5pUSVMg5IDPB3QmeK	student	0	\N	2nd Year	\N	2026-03-08 18:39:28.608168	2026-03-12 11:11:34.215674	a	b	12413566		Computer Engineering	C	Kondhwa	1234567890	["Seminars", "Music", "Dance"]	coordinator	5	2026-03-08 18:39:28.608168	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
12	\N	b@vit.edu	$2b$10$t5sD7e2bQ7ub7s3nCmY10eCPXTvKTJKnpqbS/LMfz6rCC3bgF4P7S	student	0	\N	2nd Year	\N	2026-03-08 19:02:43.457019	2026-03-12 11:11:34.215674	b	c	12413577		Computer Engineering	I	Bibwewadi		["Hackathons", "Networking"]	\N	\N	2026-03-08 19:02:43.457019	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
9	\N	tejal1@vit.edu	$2b$10$xz7hx8iPIQb39gHjQkpfC.vA9HP2qL9mTEOSSDeuu8oCbwzrYuU3C	student	0	\N	2nd Year	\N	2026-03-08 12:42:11.606249	2026-03-12 11:11:34.215674	Tejal	Jadhav	12413		Computer Engineering	A	Bibwewadi		["Robotics"]	coordinator	5	2026-03-08 12:42:11.606249	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
16	\N	sanket.d@vit.edu	$2b$10$mgxNEyEIQ6bZMNKwaEZzc.BxgY9KSc4gtFnHE88SNZdR1OXrTYSW2	student	0	\N	\N	\N	2026-03-08 22:28:01.52728	2026-03-12 11:11:34.215674	Sanket	Deshmukh	\N	\N	Mechanical	\N	\N	\N	\N	\N	\N	2026-03-08 22:28:01.52728	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
17	\N	pooja.h@vit.edu	$2b$10$afKqri4Z2M4qGBYyzFTKROua5DeMqfmZDCW0YKdPqc4kFsKnbHYOO	student	0	\N	\N	\N	2026-03-08 22:28:01.682405	2026-03-12 11:11:34.215674	Pooja	Hegde	\N	\N	ENTC	\N	\N	\N	\N	\N	\N	2026-03-08 22:28:01.682405	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
18	\N	rohan.m@vit.edu	$2b$10$zSSMZJh5YSq6UBrccnE/1.qrDM4fT35W3NQ6Ado2RLNIrfs3r.Us.	student	0	\N	\N	\N	2026-03-08 22:28:01.83493	2026-03-12 11:11:34.215674	Rohan	Mehta	\N	\N	CSE	\N	\N	\N	\N	\N	\N	2026-03-08 22:28:01.83493	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
30	\N	john@vit.edu	$2b$10$sZwVDjNdTqCL17828ODMGunez2hsjx0oR9Ojab2AxwS4ZxdA./wQm	student	0	\N	TY	\N	2026-04-26 18:45:28.269695	2026-04-26 18:45:28.269695	John	Doe	12345676		Computer Engineering	S	Bibwewadi	1234567890	[]	\N	\N	2026-04-26 18:45:28.269695	\N	\N	\N	\N	vitian	\N	\N	t	none	\N
\.


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 217
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 29, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 219
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registrations_id_seq', 29, true);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- TOC entry 4802 (class 2606 OID 16428)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 16444)
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4817 (class 2606 OID 16446)
-- Name: registrations registrations_user_id_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_event_id_key UNIQUE (user_id, event_id);


--
-- TOC entry 4798 (class 2606 OID 16413)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4800 (class 2606 OID 16411)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 1259 OID 16460)
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- TOC entry 4804 (class 1259 OID 24686)
-- Name: idx_events_category_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_category_status ON public.events USING btree (category, status);


--
-- TOC entry 4805 (class 1259 OID 24709)
-- Name: idx_events_coordinator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_coordinator ON public.events USING btree (coordinator_id);


--
-- TOC entry 4806 (class 1259 OID 16461)
-- Name: idx_events_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_created_by ON public.events USING btree (created_by);


--
-- TOC entry 4807 (class 1259 OID 16459)
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_date ON public.events USING btree (date);


--
-- TOC entry 4808 (class 1259 OID 24673)
-- Name: idx_events_faculty_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_faculty_id ON public.events USING btree (faculty_id);


--
-- TOC entry 4809 (class 1259 OID 24688)
-- Name: idx_events_organizing_club; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_organizing_club ON public.events USING btree (organizing_club);


--
-- TOC entry 4810 (class 1259 OID 24710)
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- TOC entry 4811 (class 1259 OID 16463)
-- Name: idx_registrations_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrations_event_id ON public.registrations USING btree (event_id);


--
-- TOC entry 4812 (class 1259 OID 16462)
-- Name: idx_registrations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrations_user_id ON public.registrations USING btree (user_id);


--
-- TOC entry 4813 (class 1259 OID 24711)
-- Name: idx_registrations_verification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrations_verification ON public.registrations USING btree (verification_status);


--
-- TOC entry 4791 (class 1259 OID 24687)
-- Name: idx_users_coordinator_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_coordinator_type ON public.users USING btree (coordinator_type);


--
-- TOC entry 4792 (class 1259 OID 24698)
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_department ON public.users USING btree (department);


--
-- TOC entry 4793 (class 1259 OID 24700)
-- Name: idx_users_dept_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_dept_role ON public.users USING btree (department, role);


--
-- TOC entry 4794 (class 1259 OID 16474)
-- Name: idx_users_designation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_designation ON public.users USING btree (designation);


--
-- TOC entry 4795 (class 1259 OID 16457)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4796 (class 1259 OID 16458)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4826 (class 2620 OID 16466)
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4825 (class 2620 OID 16465)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4819 (class 2606 OID 24704)
-- Name: events events_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4820 (class 2606 OID 16429)
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4821 (class 2606 OID 24681)
-- Name: events events_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- TOC entry 4822 (class 2606 OID 24668)
-- Name: events events_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4823 (class 2606 OID 16452)
-- Name: registrations registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4824 (class 2606 OID 16447)
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4818 (class 2606 OID 16468)
-- Name: users users_promoted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_promoted_by_fkey FOREIGN KEY (promoted_by) REFERENCES public.users(id) ON DELETE SET NULL;


-- Completed on 2026-04-29 22:37:40

--
-- PostgreSQL database dump complete
--

\unrestrict XM9ms7SOdbRViAYnitav4gHhJp8Gv5yqJgwhpx04KXxfhwSTxgWOqxeBhIQVK8m

