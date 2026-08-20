-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 20, 2026 at 04:26 AM
-- Server version: 11.4.12-MariaDB-cll-lve
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prasowla_floatwalk_billing`
--

-- --------------------------------------------------------

--
-- Table structure for table `code_sequences`
--

CREATE TABLE `code_sequences` (
  `prefix` varchar(10) NOT NULL,
  `last_value` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `code_sequences`
--

INSERT INTO `code_sequences` (`prefix`, `last_value`, `updated_at`) VALUES
('ADV', 16, '2026-08-15 12:33:23.335'),
('EXP', 10, '2026-08-14 15:44:17.997'),
('INV', 132, '2026-08-18 14:55:59.243'),
('PUR', 0, '2026-02-12 17:07:24.468'),
('QUO', 1, '2026-02-12 21:18:17.740');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `alt_contact` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `mobile`, `whatsapp`, `alt_contact`, `email`, `gender`, `address`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
('04c29893-471f-493f-8333-d5404011480f', 'Krishnaveni', '8778350258', NULL, NULL, NULL, NULL, 'Koomarapalayam', '', '2026-06-22 19:39:12.911', '2026-06-22 19:39:12.911', NULL),
('05710c33-5042-4239-999f-51a56e036118', 'Kathir', '8838997015', NULL, NULL, NULL, NULL, 'kanur pudur', '', '2026-05-13 17:01:31.537', '2026-05-13 17:01:31.537', NULL),
('085a8fc6-bab2-483c-9707-5591141ee708', 'Sarasathal', '9786511756', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-16 15:11:01.670', '2026-06-16 15:11:01.670', NULL),
('08c6a172-b067-4e09-99df-70d83d8747a2', 'Abyaz Ahmed', '9944933138', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-24 15:02:33.169', '2026-07-24 15:02:33.169', NULL),
('09414bd9-b360-41dd-a407-50c9b1fb9d3d', 'Thangavel M', '9788142435', NULL, NULL, NULL, NULL, 'Dharapuram', '', '2026-08-14 17:08:20.978', '2026-08-14 17:08:20.978', NULL),
('0b9e998e-c48d-4104-bdf3-8cd0b5c74c6c', 'Jasmine Cecilia', '7010872285', NULL, NULL, NULL, NULL, 'Coimbatore', '', '2026-07-17 12:18:23.460', '2026-07-17 12:18:23.460', NULL),
('0c5754dc-87c0-43ac-8472-c7b649456429', 'Ranjitham S', '8838861588', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-08 18:04:42.719', '2026-08-08 18:04:42.719', NULL),
('0c99ae1d-4f03-4245-8cd8-24e9c2730c3c', 'Suryaprabha N', '7708001663', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:22:45.521', '2026-05-18 15:22:45.521', NULL),
('102019d1-56e9-4560-9569-bc337cd4046b', 'Shrithick dev SK', '9655063651', NULL, NULL, NULL, NULL, '', '', '2026-05-18 16:45:31.791', '2026-05-18 16:45:31.791', NULL),
('117cc2df-eb45-4a5d-9a5d-faf80e313f94', 'Sameena M', '9843344404', NULL, NULL, NULL, NULL, 'Avinashi ', '', '2026-08-10 19:46:16.161', '2026-08-10 19:46:16.161', NULL),
('1573dca7-f4c9-48a2-980e-c3ae4b1b97cd', 'Sathiswari', '6374254853', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-05-09 17:40:45.865', '2026-05-09 17:40:45.865', NULL),
('157fbb69-ed41-44ab-ad22-243a1e2c9d48', 'Bharathkumar R', '9791905479', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:42:35.529', '2026-05-18 15:42:35.529', NULL),
('15e13924-7348-4b63-82dc-3c92ee23099e', 'Vasanthi G', '9994383666', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-14 15:17:43.602', '2026-08-14 15:17:43.602', NULL),
('16844649-6e58-4f87-a30f-40dce733cc68', 'Ravi L', '8056189730', NULL, NULL, NULL, NULL, 'Muthaliapalayam ,Tiruppur', '', '2026-06-26 11:46:42.003', '2026-06-26 11:46:42.003', NULL),
('17473b32-39cd-48b3-9daa-96c1affc29a0', 'Ragupathi KM', '9843622567', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-18 13:46:26.186', '2026-08-18 13:46:26.186', NULL),
('18f977fe-1c94-4119-b755-ca74941828e7', 'Bala kumar M', '9025303572', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-15 14:58:43.697', '2026-08-15 14:58:43.697', NULL),
('26ea31c8-b3a3-47ce-afc7-b812735860c8', 'Sundarampal K', '9894437291', NULL, NULL, NULL, NULL, 'Sirupulyvapatti ,Tiruppur', '', '2026-05-20 16:04:31.594', '2026-05-20 16:04:31.594', NULL),
('2a537091-3309-4db3-b144-15542659ff3f', 'Selvaraj M', '9944814803', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:24:25.613', '2026-05-18 15:24:25.613', NULL),
('2b9bd7ea-3e23-4f03-8c54-4fbe083b5a67', 'Selvarani K', '9443347376', NULL, NULL, NULL, NULL, '', '', '2026-08-13 16:57:36.714', '2026-08-13 16:57:36.714', NULL),
('31e444cd-897d-4365-a33c-23437199a51b', 'Charles', '9688288827', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-05-13 18:19:30.829', '2026-05-13 18:19:30.829', NULL),
('31f8e3a3-4a2c-4dae-9238-a97978ff6fe8', 'Monish JB', '9790655066', NULL, NULL, NULL, NULL, 'Rakkiyapalayam Tiruppur', '', '2026-05-30 11:47:26.509', '2026-05-30 11:47:26.509', NULL),
('32a82292-c6a4-430b-b046-f1f0c34c9666', 'Andal .N', '9789658102', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-26 11:41:00.553', '2026-06-26 11:41:00.553', NULL),
('32fc80ca-4126-4f7d-b39d-447ad2854692', 'Srinivasan R', '8825801180', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:33:41.460', '2026-05-18 15:33:41.460', NULL),
('375cd8b5-cb53-43e5-a634-5fa86a9bca94', 'Shanthi R', '9940775800', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-29 15:51:39.430', '2026-07-29 15:51:39.430', NULL),
('385155f6-a356-42ad-a633-45ef187adf09', 'Chandran .S', '8124545454', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-05-20 16:12:01.524', '2026-05-20 16:12:01.524', NULL),
('3ea2c0ce-5c20-47cd-b9ba-8e4cff2a981e', 'Sankar V', '8667458698', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-08 17:20:29.452', '2026-08-08 17:20:29.452', NULL),
('3fc3f937-10c8-4d54-ae11-2282c0a59bcd', 'Kandasaamy A', '9500922133', NULL, NULL, NULL, NULL, 'Sirupuluvapatti,Tiruppur', '', '2026-05-20 11:17:39.367', '2026-05-20 11:17:39.367', NULL),
('40eaa194-e381-4b26-a481-a1f50fb17fc3', 'Loganayagi V', '7339191452', NULL, NULL, NULL, NULL, 'Avinashi ', '', '2026-08-11 12:52:57.412', '2026-08-11 12:52:57.412', NULL),
('4275416b-53dd-4c95-99f6-eadd5374eca0', 'Ananda Kumar M', '9789452329', NULL, NULL, NULL, NULL, 'Karumathampatty', '', '2026-07-31 18:26:27.744', '2026-07-31 18:26:27.744', NULL),
('432e0a19-a7aa-4f34-b4cb-3729ca734b31', 'Lalitha B', '9047376584', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-11 15:13:23.431', '2026-06-11 15:13:23.431', NULL),
('464262b1-c28f-483e-b7a2-3a0b96619966', 'Manokar K', '9994444557', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-01 16:35:34.872', '2026-08-01 16:35:34.872', NULL),
('4ae61567-79f9-4842-b231-557e1ea55f48', 'Shundhararaj GK', '9244415444', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-06 12:26:52.248', '2026-06-06 12:26:52.248', NULL),
('4ece479c-2f0e-43dc-9661-199b488a3c8c', 'Pranav ', '9976140100', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-17 18:03:19.241', '2026-06-17 18:03:19.241', NULL),
('50613a2d-9916-45bb-a7c2-e8ad30cb26db', 'Stephen Raj S', '7339086704', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:08:32.244', '2026-05-18 15:08:32.244', NULL),
('5125968b-e91f-4767-ab27-8bb1dbf83091', 'Aparna S', '9629170464', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-25 11:51:51.196', '2026-07-25 11:51:51.196', NULL),
('518bbdcc-f6f6-4c75-9953-2e256084b0ef', 'Maragatham M', '8012329769', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:36:54.480', '2026-05-18 15:36:54.480', NULL),
('5242834d-711a-4993-b3f3-227d8f2cf6b1', 'Deivaththal D', '9943160720', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-05-20 17:34:13.052', '2026-05-20 17:34:13.052', NULL),
('5288af98-fadd-405e-9338-e3c609064254', 'Gohila R', '9025384124', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-12 18:46:47.821', '2026-08-12 18:46:47.821', NULL),
('56b8fc2a-1e8b-414d-a043-e1a81ad317d7', 'Ganeasan R', '9047374546', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-13 16:06:33.583', '2026-07-13 16:06:33.583', NULL),
('5836057d-788c-4ff2-bcc5-0d1259c3f54d', 'Sankar V', '9965248021', NULL, NULL, NULL, NULL, 'Aaththupalayam Tiruppur', '', '2026-05-29 11:47:06.466', '2026-05-29 11:47:06.466', NULL),
('58690478-5efe-4ac6-a267-9bd6d1f1bf2a', 'Sinnammal S', '9487501120', NULL, NULL, NULL, NULL, 'Nallur ,Tiruppur', '', '2026-07-25 15:23:49.401', '2026-07-25 15:23:49.401', NULL),
('591615be-8f5d-4b91-aec4-5823eda93230', 'Ravi Chandran C', '9659465552', NULL, NULL, NULL, NULL, 'Truppur', '', '2026-08-18 13:51:42.935', '2026-08-18 13:51:42.935', NULL),
('5a0b2cf9-8199-47c0-b096-c666576032a8', 'Klydin ,Krifin', '9894436377', NULL, NULL, NULL, NULL, 'Avinashi', '', '2026-08-11 17:28:16.688', '2026-08-11 17:28:16.688', NULL),
('5a8be0bf-7bef-44a8-8f95-35bc3ec5bb67', 'Saraswathi R', '9597598414', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-24 15:04:41.690', '2026-07-24 15:04:41.690', NULL),
('5bafac00-5f77-4456-ae68-edd2ad9f0625', 'Kumar S', '9597841595', NULL, NULL, NULL, NULL, '', '', '2026-08-12 17:05:35.820', '2026-08-12 17:05:35.820', NULL),
('5e5891d5-891e-4e3d-b7f0-ebcbf03fb444', 'Hema K', '7708299609', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:34:59.015', '2026-05-18 15:34:59.015', NULL),
('6113a579-1a63-4207-8eaa-af5cf0da69ea', 'Shanmuga Sundaram D', '9940710391', NULL, NULL, NULL, NULL, 'Teachers colony ,Tiruppur', '', '2026-05-31 10:36:00.357', '2026-05-31 10:36:00.357', NULL),
('68ba1d96-dea8-46ff-a03d-e1ac709b5cd4', 'Sheeba Cecilia', '9786036120', NULL, NULL, NULL, NULL, 'Coimbatore', '', '2026-07-17 12:22:08.154', '2026-07-17 12:22:08.154', NULL),
('6ad96ce8-8bb6-43ab-88d5-b1b3876e9fb2', 'Radha Krishnan', '9003922988', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-10 14:37:33.770', '2026-08-10 14:37:33.770', NULL),
('6afcde4a-9fba-4c37-8cbf-2522acea42c3', 'Selvarani K', '9443473762', NULL, NULL, NULL, NULL, 'Tiruupur', '', '2026-08-15 15:04:33.358', '2026-08-15 15:04:33.358', NULL),
('6c9bfa22-2baf-4b7e-b469-9bdd233251c1', 'Eswaramurthy N', '9894222277', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-05-19 14:20:01.314', '2026-05-19 14:20:01.314', NULL),
('70d3dcd4-0377-41a2-98bc-f3b564728193', 'Dhinakaran B', '7904167553', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:12:06.872', '2026-05-18 15:12:06.872', NULL),
('71977571-2205-4dea-9a09-0342fa5bf088', 'Halima L', '7010715382', NULL, NULL, NULL, NULL, 'Tiruppur ', '', '2026-07-17 10:49:47.184', '2026-07-17 10:49:47.184', NULL),
('737d4af2-74cf-4eaa-9c61-3439471a7c97', 'Karthick S', '8838638074', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:17:26.354', '2026-05-18 15:17:26.354', NULL),
('796c001f-7ef3-4be2-9f5c-f5629b3fa519', 'Vijaya Lakshmi S', '9750218172', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-13 17:25:50.193', '2026-08-13 17:25:50.193', NULL),
('7fbda382-8af9-43cb-a7ee-e099de027932', 'Aaran  P', '9384929923', NULL, NULL, NULL, NULL, 'Semmipalayam ,Palladam', '', '2026-07-29 15:57:45.807', '2026-07-29 15:57:45.807', NULL),
('8014a80f-4a15-4087-acb3-f2c9c5c958a7', 'Manonmani R', '8610448099', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-08 18:12:13.298', '2026-07-08 18:12:13.298', NULL),
('863a3d15-d18f-4af6-a0bd-9a4b9f590419', 'Raja R', '9688586595', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-08 11:37:28.916', '2026-06-08 11:37:28.916', NULL),
('864b92a3-32a7-4976-afa1-46a8b28d80b8', 'Karunambal s', '8122695966', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-14 13:22:56.793', '2026-07-14 13:22:56.793', NULL),
('88e7d2de-5b40-45e8-8428-424a5c9df39b', 'Ambika Devi M', '9976563263', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-10 14:06:36.491', '2026-08-10 14:06:36.491', NULL),
('8d475be5-5677-40ad-863f-2983832dab11', 'Ramakrishnan T', '9042903133', NULL, NULL, NULL, NULL, '', '', '2026-05-18 14:56:25.744', '2026-05-18 14:56:25.744', NULL),
('8ebac4fd-efab-4708-9b11-9dba368d84dc', 'Sumathibal R', '9442206364', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:21:00.543', '2026-05-18 15:21:00.543', NULL),
('92317b0a-1f90-44d7-ae4a-14943bbd7442', 'Eswaran M', '7092242461', NULL, NULL, NULL, NULL, 'Tituppur', '', '2026-07-16 12:02:31.753', '2026-07-16 12:02:31.753', NULL),
('92cce363-8a2b-44ec-99dd-946dd667a0fa', 'Nithya ', '9994356667', NULL, NULL, NULL, NULL, 'Tiruppur ', '', '2026-07-28 17:37:53.911', '2026-07-28 17:37:53.911', NULL),
('944ad35b-5192-4ac5-b8a3-1638f7e916a3', 'Chitra M', '9884717669', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-15 15:01:38.787', '2026-08-15 15:01:38.787', NULL),
('96297c58-3a3c-4f0d-8cc0-b83c3f97697a', 'Bowsiya A', '9842518565', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-14 15:14:55.009', '2026-08-14 15:14:55.009', NULL),
('9692c892-e812-43a8-9bea-769ba7d88898', 'Kala R', '9524678543', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-13 17:10:27.311', '2026-08-13 17:10:27.311', NULL),
('97d656e0-97c8-45b6-9d6a-f93f7e673cb2', 'Revathi', '8667497827', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-18 20:27:58.388', '2026-07-18 20:27:58.388', NULL),
('9d43fbc1-d441-45bd-af18-1a5bdac0705b', 'Hithyasan M', '9498177284', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-23 17:36:07.169', '2026-07-23 17:36:07.169', NULL),
('9d77d14a-b920-4449-b929-59f69d6684cf', 'Arul Anandan D', '9944453185', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-01 17:30:38.844', '2026-06-01 17:30:38.844', NULL),
('a1e69215-0c01-418f-b4a1-876d30b55184', 'MOhana Sundhram ', '9842788395', NULL, NULL, NULL, NULL, 'Perundurai', '', '2026-08-06 16:57:57.030', '2026-08-06 16:57:57.030', NULL),
('a2333e6d-b1ed-4be2-92ab-dc179c4f17c7', 'Soundariya Prasanth R', '9500588297', NULL, NULL, NULL, NULL, 'Gandhi Nagar ,Tiruppur', '', '2026-06-09 12:35:32.323', '2026-06-09 12:35:32.323', NULL),
('a5d1dd42-d585-47d0-9490-af9a5958f658', 'Kamalaveni N', '9600859972', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-11 17:19:50.359', '2026-07-11 17:19:50.359', NULL),
('a7958a02-0ac6-401c-96a4-0eb9e2565b69', 'Nirmala S', '9994838466', NULL, NULL, NULL, NULL, 'Avinashi', '', '2026-08-10 19:53:05.626', '2026-08-10 19:53:05.626', NULL),
('aa3c8aaa-7ced-4fa9-a9dd-018ecf63438e', 'ISAAC JOHN', '9843808112', NULL, NULL, NULL, NULL, '', '', '2026-04-09 11:18:26.046', '2026-04-09 11:18:26.046', NULL),
('aa4240e1-42da-44bb-aa7e-a28ad4783e8c', 'Ponmani S', '9842532622', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-08 17:29:42.266', '2026-08-08 17:29:42.266', NULL),
('ad24ae56-3d54-4402-bc38-06852a4de81c', 'NiramaladeviS', '9962828135', NULL, NULL, NULL, NULL, 'Karuvalur', '', '2026-06-13 18:24:09.995', '2026-06-13 18:24:09.995', NULL),
('adadb714-8aa9-494c-89a1-5ca4365ede1f', 'Sumithra C', '9865795020', NULL, NULL, NULL, NULL, 'Avinashi', '', '2026-07-20 18:44:25.742', '2026-07-20 18:44:25.742', NULL),
('ae7d5d01-c7b8-44f0-98f0-dae5a6e47318', 'Deivathal R', '9994350885', NULL, NULL, NULL, NULL, 'Tiruppour', '', '2026-08-05 13:22:43.188', '2026-08-05 13:22:43.188', NULL),
('af5abd1e-8a06-4172-997e-018f31dba463', 'Fr. Felix Kennedy', '7339596704', NULL, NULL, NULL, NULL, 'Kadampur', '', '2026-04-30 14:38:13.948', '2026-04-30 14:38:13.948', NULL),
('b23b2693-4d6d-43d5-b35f-3c2066f28a43', 'Alexis Garrison ', '9994127203', NULL, NULL, NULL, NULL, 'Coimbatore', '', '2026-06-29 18:47:37.645', '2026-06-29 18:47:37.645', NULL),
('b6434218-974e-45f1-bedf-bb6a3754c09e', 'Valliyappan AR', '8220114999', NULL, NULL, NULL, NULL, '', '', '2026-05-18 15:14:16.271', '2026-05-18 15:14:16.271', NULL),
('bdad62e5-b6ea-4f2e-9901-776b5a8bc569', 'Sharmila JP', '9994731731', NULL, NULL, NULL, NULL, 'Kulathu Puthur', '', '2026-08-18 14:55:58.002', '2026-08-18 14:55:58.002', NULL),
('bf362791-33f5-4f44-9a71-5127d81885c4', 'Palani samy          ', '9750218171', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-13 17:17:58.533', '2026-08-13 17:17:58.533', NULL),
('c3c31846-5bb6-4811-9863-b14981745c68', 'Mohammed Shafi', '9500575765', NULL, NULL, NULL, NULL, 'Veerapandi Pirivu ,Police station', '', '2026-05-19 13:31:02.457', '2026-05-19 13:31:02.457', NULL),
('c89977dd-6091-4cd0-a03d-bfac29b35134', 'Manonmani C', '9659375211', NULL, NULL, NULL, NULL, 'Thiyagi Kumaran Colony,Tiruppur', '', '2026-05-29 11:03:07.377', '2026-05-29 11:03:07.377', NULL),
('cad7da4f-f3cb-4c69-bcf1-3b205fa2c71e', 'Ruba Sri C', '9688321170', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-17 16:05:40.837', '2026-08-17 16:05:40.837', NULL),
('cd34d0d6-b2ea-4ca4-b708-ba998d835bd2', 'Eswaran D', '9443031860', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-05-02 12:53:23.590', '2026-05-02 12:53:23.590', NULL),
('cdb9addd-fa47-4d70-b190-1b2bf50ecd67', 'Poovathal .P', '8946049501', NULL, NULL, NULL, NULL, 'Muthalipalayam,Sevur', '', '2026-05-05 16:36:23.755', '2026-05-05 16:36:23.755', NULL),
('d09e7bf6-bc2f-4c39-9566-7b92306a46dd', 'Vidhya ,Masiriyammal ', '9994755445', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-14 15:34:17.382', '2026-08-14 15:34:17.382', NULL),
('e0f3dfaf-b9d2-4e67-8625-23e95110f0ea', 'Selvarani B', '9597924709', NULL, NULL, NULL, NULL, 'Palladam', '', '2026-08-05 13:29:47.376', '2026-08-05 13:29:47.376', NULL),
('e25e70dd-7331-45de-9bdf-dcf7f4a731b5', 'Omana T', '9600581502', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-17 18:00:35.917', '2026-06-17 18:00:35.917', NULL),
('e32ecfd4-716e-4b9e-a83d-bc3af1a2eb73', 'Rekha C', '9597704343', NULL, NULL, NULL, NULL, 'Avinashi', '', '2026-06-12 14:31:37.304', '2026-06-12 14:31:37.304', NULL),
('e64aab4d-6453-4666-81d7-0ef1550ec8a0', 'Yukitha V', '9843057822', NULL, NULL, NULL, NULL, 'Sivan Theatre,Tiruppur', '', '2026-05-22 14:58:35.029', '2026-05-22 14:58:35.029', NULL),
('e6dcda56-f856-4331-8f6a-38d910fdf59a', 'Kalaivani M', '9865677733', NULL, NULL, NULL, NULL, 'Palladam', '', '2026-07-11 17:26:11.441', '2026-07-11 17:26:11.441', NULL),
('ea06c6a6-b693-41b1-b874-e9959fde0d36', 'Lokesh Kumar P', '9966050505', NULL, NULL, NULL, NULL, '', '', '2026-05-12 18:52:36.413', '2026-05-12 18:52:36.413', NULL),
('ec010f73-10d5-4308-bd90-845eea4149f8', 'Kanagaraj D', '6385576829', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-06-17 18:12:29.078', '2026-06-17 18:12:29.078', NULL),
('ed4f2cc4-fa4e-491a-9cdd-cf2a638b7dce', 'Lakshmi N', '9677659596', NULL, NULL, NULL, NULL, 'Near Shree Hospital, Puliyakulam ,Coimbatore', '', '2026-07-16 14:35:25.336', '2026-07-16 14:35:25.336', NULL),
('efa189e5-131c-48f2-ba79-533a57909eda', 'Praveen', '8508339400', NULL, NULL, NULL, NULL, 'CBR', '', '2026-04-06 13:17:00.896', '2026-04-06 13:17:00.896', NULL),
('f3ca00e7-6872-4599-a0ce-89d7aba71ca3', 'Halan R', '9442369490', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-08-15 12:33:22.024', '2026-08-15 12:33:22.024', NULL),
('f4a3f90f-af42-46e5-9827-4a2983b32f6f', 'Poornima N', '9789660710', NULL, NULL, NULL, NULL, 'Alagar Pudhur ,Salem', '', '2026-05-21 14:01:54.202', '2026-05-21 14:01:54.202', NULL),
('f4f8c5f8-2bc0-4ba0-8f5a-fef092a4f719', 'GeethaT', '9942632236', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-14 13:18:49.495', '2026-07-14 13:18:49.495', NULL),
('f6682772-e378-432b-a8a2-53765bf95ba7', 'Kannan B', '8056823948', NULL, NULL, NULL, NULL, '', '', '2026-08-08 16:07:19.222', '2026-08-08 16:07:19.222', NULL),
('f69bc797-b314-4e1d-9d80-f75ad4193e70', 'Samruthi B', '9842945070', NULL, NULL, NULL, NULL, 'Vanjipalayam,kumaran Textiles', '', '2026-05-20 17:38:50.208', '2026-05-20 17:38:50.208', NULL),
('f767c0ec-4118-4516-9f49-3e24cad0883b', 'Samruthi B', '9842345070', NULL, NULL, NULL, NULL, 'Vanjipalayam,Tiruppur', '', '2026-05-21 12:16:33.113', '2026-05-21 12:16:33.113', NULL),
('f8b6021e-c064-47fd-85bc-a0d0474c4197', 'Saraswathi R', '9697598414', NULL, NULL, NULL, NULL, 'Tiruppur', '', '2026-07-28 17:39:46.933', '2026-07-28 17:39:46.933', NULL),
('fc7ffe39-b251-4541-87b9-b4261cd9ec34', 'Gnana Prakasam', '7845456609', '7845456609', NULL, 'agprakash406@gmail.com', 'male', 'Murugabavanam, DIndigul', '', '2026-02-13 14:48:44.941', '2026-02-13 14:48:44.941', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` char(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `category` varchar(100) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `description` text DEFAULT NULL,
  `expense_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `code`, `category`, `amount`, `description`, `expense_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
('03296c5d-10cd-4c9f-9d42-66348073c462', 'EXP-008', 'Electricity', 382.00, '', '2026-08-14', '2026-08-14 15:42:15.473', '2026-08-14 15:42:15.473', NULL),
('0d48abe9-4dde-4551-b2bb-4c4af2fd5a23', 'EXP-003', 'Electricity', 289.00, '', '2026-02-03', '2026-04-17 15:11:57.738', '2026-04-17 15:11:57.738', NULL),
('174198d1-dbe3-4081-8ecd-491aaadb84df', 'EXP-007', 'Other', 355.00, 'Wifi', '2026-04-06', '2026-04-17 15:16:16.760', '2026-04-17 15:16:55.019', NULL),
('3a5f4f7d-5b9a-4117-ba60-91a6ac7fb5cb', 'EXP-009', 'Electricity', 872.00, '', '2026-08-14', '2026-08-14 15:43:10.269', '2026-08-14 15:43:10.269', NULL),
('6c79984f-efb9-454e-b96f-6c7ed138c157', 'EXP-004', 'Electricity', 499.00, '', '2026-04-17', '2026-04-17 15:12:11.842', '2026-04-17 15:12:11.842', NULL),
('714ffdc3-7d4d-4bb1-8d52-ccbb3ca0e599', 'EXP-005', 'Other', 942.00, 'Airtel Wifi', '2026-04-17', '2026-04-17 15:15:17.978', '2026-04-17 15:15:17.978', NULL),
('9a0a0840-be28-4309-a87e-757a5648f4d3', 'EXP-010', 'Other', 6306.00, '', '2026-08-14', '2026-08-14 15:44:18.369', '2026-08-14 15:44:18.369', NULL),
('d43c4770-75ab-4a83-9478-11866fd7a4ca', 'EXP-002', 'Salary', 15000.00, '', '2026-04-04', '2026-04-17 15:10:57.630', '2026-04-17 15:10:57.630', NULL),
('f34c7c2a-e68b-4103-b90b-af1fde98d72c', 'EXP-006', 'Other', 587.00, 'Wifi', '2026-02-06', '2026-04-17 15:15:51.081', '2026-04-17 15:16:37.453', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` char(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `type` varchar(50) DEFAULT 'Invoice',
  `customer_id` char(36) NOT NULL,
  `status` enum('paid','pending','partial','hold') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(14,2) DEFAULT NULL,
  `gst_percent` decimal(5,2) DEFAULT NULL,
  `gst_amount` decimal(14,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `code`, `type`, `customer_id`, `status`, `total_amount`, `paid_amount`, `subtotal`, `gst_percent`, `gst_amount`, `notes`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('04b2fdc3-9e9e-4389-b782-84063db3728f', 'INV-029', 'Invoice', 'aa3c8aaa-7ced-4fa9-a9dd-018ecf63438e', 'partial', 8700.00, 5000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-04-09 11:18:31.047', '2026-04-09 11:18:31.047', NULL),
('0b1ad458-09a9-41d6-a273-60b0da71a922', 'INV-101', 'Invoice', 'f8b6021e-c064-47fd-85bc-a0d0474c4197', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-28 17:39:52.114', '2026-07-28 17:40:13.378', NULL),
('0c14184f-987b-432a-a32f-e8dd73b0beba', 'ADV-011', 'Invoice', '085a8fc6-bab2-483c-9707-5591141ee708', 'paid', 3100.00, 1000.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-16 15:11:02.893', '2026-07-06 19:03:48.095', NULL),
('0e22a08a-5e34-4e24-b1d5-6ce0dc216b16', 'INV-045', 'Invoice', '32fc80ca-4126-4f7d-b39d-447ad2854692', 'paid', 2100.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:33:44.549', '2026-05-18 15:33:44.549', NULL),
('10ff7012-8d62-43f3-b62a-c562112f01e6', 'INV-094', 'Invoice', 'adadb714-8aa9-494c-89a1-5ca4365ede1f', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-20 18:44:27.345', '2026-07-20 18:44:27.345', NULL),
('1636c77b-4ae8-48f5-a7bf-a4d47c773048', 'INV-041', 'Invoice', '737d4af2-74cf-4eaa-9c61-3439471a7c97', 'paid', 3800.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:17:27.537', '2026-05-18 15:17:27.537', NULL),
('1ab82607-aec1-4f22-b7d8-d5ea9242eeee', 'INV-130', 'Invoice', '17473b32-39cd-48b3-9daa-96c1affc29a0', 'paid', 4100.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-18 13:46:27.530', '2026-08-18 13:46:27.530', NULL),
('1c14bc98-71fa-4ec2-9650-04de847102ca', 'ADV-008', 'Invoice', '6113a579-1a63-4207-8eaa-af5cf0da69ea', 'paid', 4100.00, 2000.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-31 10:36:01.818', '2026-06-13 17:48:53.348', NULL),
('1e7e5e88-f59d-4207-8dda-5cf9fef7816a', 'INV-117', 'Invoice', '5288af98-fadd-405e-9338-e3c609064254', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-12 18:46:49.163', '2026-08-12 18:46:49.163', NULL),
('205815ed-332e-4623-aba7-783050bed736', 'INV-084', 'Invoice', '56b8fc2a-1e8b-414d-a043-e1a81ad317d7', 'paid', 4100.00, 2500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-13 16:06:35.040', '2026-07-13 16:06:35.040', NULL),
('24ae8be5-f960-43a4-ac8c-8ca67c70af78', 'INV-032', 'Invoice', 'cdb9addd-fa47-4d70-b190-1b2bf50ecd67', 'pending', 3800.00, 2300.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-05 16:36:25.186', '2026-05-05 16:38:37.789', NULL),
('2d75a70f-0c8f-4715-9e42-0b4b77167c88', 'INV-122', 'Invoice', '96297c58-3a3c-4f0d-8cc0-b83c3f97697a', 'paid', 3600.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-14 15:14:58.611', '2026-08-14 15:14:58.611', NULL),
('31f950cc-5d9c-426f-8f00-332964c67aac', 'INV-051', 'Invoice', '6c9bfa22-2baf-4b7e-b469-9bdd233251c1', 'paid', 3800.00, 2300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-19 14:20:02.510', '2026-05-19 14:20:02.510', NULL),
('3724929f-b18e-46f4-a135-a3f6b8332924', 'INV-126', 'Invoice', '18f977fe-1c94-4119-b755-ca74941828e7', 'paid', 3600.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-15 14:58:46.306', '2026-08-15 14:58:46.306', NULL),
('4015862b-4102-4345-a7b0-b9c722a9611c', 'INV-055', 'Invoice', '5242834d-711a-4993-b3f3-227d8f2cf6b1', 'paid', 2000.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-20 17:34:14.397', '2026-05-20 17:34:14.397', NULL),
('41f61f88-df55-4462-a32b-16d3343c908f', 'INV-108', 'Invoice', 'aa4240e1-42da-44bb-aa7e-a28ad4783e8c', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-08 17:29:43.730', '2026-08-08 17:29:43.730', NULL),
('42141180-ec81-48a1-805e-bd5f53d5dc39', 'INV-059', 'Invoice', 'cdb9addd-fa47-4d70-b190-1b2bf50ecd67', 'paid', 3800.00, 2300.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-23 18:57:29.146', '2026-05-23 18:57:41.355', NULL),
('43ad3181-0186-4857-a195-6be6bf6cfa0a', 'INV-036', 'Invoice', '8d475be5-5677-40ad-863f-2983832dab11', 'paid', 3300.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 14:56:27.134', '2026-05-18 14:56:27.134', NULL),
('44cb0c70-9348-45ec-b785-7a39d574ce69', 'INV-062', 'Invoice', '9d77d14a-b920-4449-b929-59f69d6684cf', 'paid', 3550.00, 1700.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-01 17:30:40.061', '2026-06-01 17:30:40.061', NULL),
('451d088e-c18c-4ac2-8fbc-70f8a924a513', 'INV-037', 'Invoice', '50613a2d-9916-45bb-a7c2-e8ad30cb26db', 'paid', 3500.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:08:33.423', '2026-05-18 15:08:33.423', NULL),
('45931263-7f8f-4cd1-83df-d819b25ee88b', 'INV-054', 'Invoice', '385155f6-a356-42ad-a633-45ef187adf09', 'paid', 3800.00, 1800.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-20 16:12:02.839', '2026-05-20 16:42:54.022', NULL),
('4886445f-25aa-4ca0-a736-8b012f8d4a5d', 'ADV-005', 'Advance Payment', '05710c33-5042-4239-999f-51a56e036118', 'pending', 2500.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-13 17:01:32.848', '2026-05-13 17:01:32.848', NULL),
('4a264a30-6a91-4eac-b973-7153c7597557', 'ADV-004', 'Advance Payment', 'fc7ffe39-b251-4541-87b9-b4261cd9ec34', 'partial', 2195.00, 900.00, 0.00, 12.00, 235.20, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-03 12:05:22.669', '2026-05-03 14:23:46.722', NULL),
('4a6092a4-4f15-4736-b15e-fae2577c2e5a', 'INV-111', 'Invoice', '6ad96ce8-8bb6-43ab-88d5-b1b3876e9fb2', 'paid', 3600.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-10 14:37:35.454', '2026-08-10 14:37:35.454', NULL),
('4eb951d3-05c7-4c30-8387-fa6e21734d61', 'INV-129', 'Invoice', 'cad7da4f-f3cb-4c69-bcf1-3b205fa2c71e', 'paid', 3900.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-17 16:05:43.882', '2026-08-17 16:05:43.882', NULL),
('57fefae8-de0b-434b-b1e4-ef2263a4c480', 'INV-072', 'Invoice', 'ec010f73-10d5-4308-bd90-845eea4149f8', 'paid', 4000.00, 0.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-22 19:23:45.631', '2026-06-22 19:24:11.193', NULL),
('580e3f61-a670-4c96-8de8-89368cdc84d7', 'INV-087', 'Invoice', 'ed4f2cc4-fa4e-491a-9cdd-cf2a638b7dce', 'partial', 3600.00, 800.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-16 14:35:26.786', '2026-07-16 14:35:26.786', NULL),
('581f8bca-dc7c-45f4-b939-525dea88c6ed', 'INV-076', 'Invoice', 'ad24ae56-3d54-4402-bc38-06852a4de81c', 'paid', 2200.00, 1300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-23 19:33:55.241', '2026-06-23 19:33:55.241', NULL),
('5f641bc6-ac82-48cb-9e86-9bad5f423424', 'INV-100', 'Invoice', '92cce363-8a2b-44ec-99dd-946dd667a0fa', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-28 17:37:55.284', '2026-07-28 17:37:55.284', NULL),
('60564936-29be-441b-b223-833241a3dda0', 'INV-118', 'Invoice', '2b9bd7ea-3e23-4f03-8c54-4fbe083b5a67', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-13 16:57:39.592', '2026-08-13 16:57:39.592', NULL),
('65f7184a-b0f2-4f4e-b3b5-afe02daa96f9', 'INV-077', 'Invoice', '32a82292-c6a4-430b-b046-f1f0c34c9666', 'paid', 2100.00, 1300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-26 11:41:02.667', '2026-06-26 11:41:02.667', NULL),
('66274354-54e4-4b58-a6c4-8d38cf795055', 'INV-064', 'Invoice', '863a3d15-d18f-4af6-a0bd-9a4b9f590419', 'paid', 3600.00, 2200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-08 11:37:30.502', '2026-06-08 11:37:30.502', NULL),
('675c0cdf-f1e8-4ffb-980a-487eee06ce60', 'INV-131', 'Invoice', '591615be-8f5d-4b91-aec4-5823eda93230', 'paid', 4100.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-18 13:51:44.545', '2026-08-18 13:51:44.545', NULL),
('68105bfc-ff06-40b0-b67a-294fb278170e', 'ADV-006', 'Invoice', 'e64aab4d-6453-4666-81d7-0ef1550ec8a0', 'paid', 1600.00, 800.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-22 14:58:36.368', '2026-06-01 13:36:53.949', NULL),
('69ef5097-5bc3-423d-83c0-2e026bc8c946', 'INV-112', 'Invoice', '117cc2df-eb45-4a5d-9a5d-faf80e313f94', 'paid', 3600.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-10 19:46:17.778', '2026-08-10 19:46:17.778', NULL),
('7252b406-6126-4624-84c2-6572735d0f01', 'INV-058', 'Invoice', 'f4a3f90f-af42-46e5-9827-4a2983b32f6f', 'paid', 4800.00, 2300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-21 14:01:55.654', '2026-05-21 14:01:55.654', NULL),
('72c7a800-00db-4e48-9904-422a3a5c0d17', 'INV-047', 'Invoice', '518bbdcc-f6f6-4c75-9953-2e256084b0ef', 'paid', 2000.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:36:55.838', '2026-05-18 15:36:55.838', NULL),
('773e1bf9-b818-4f6e-941b-778edb2f7789', 'INV-035', 'Invoice', '31e444cd-897d-4365-a33c-23437199a51b', 'paid', 3200.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-13 18:19:32.022', '2026-05-13 18:19:32.022', NULL),
('80550230-43cc-4a87-8e98-4cdfd8662776', 'INV-109', 'Invoice', '0c5754dc-87c0-43ac-8472-c7b649456429', 'paid', 2200.00, 1500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-08 18:04:45.144', '2026-08-08 18:04:45.144', NULL),
('8512d78e-5594-46f3-bd94-bf3d04738dfc', 'ADV-007', 'Advance Payment', '31f8e3a3-4a2c-4dae-9238-a97978ff6fe8', 'pending', 1800.00, 1000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-30 11:47:30.237', '2026-05-30 11:47:30.237', NULL),
('85623e40-85b0-436b-85f6-18710ad9b2e4', 'INV-093', 'Invoice', 'e6dcda56-f856-4331-8f6a-38d910fdf59a', 'partial', 2880.00, 2100.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-20 12:42:14.593', '2026-07-20 12:42:14.593', NULL),
('875afd78-51f4-47fc-8ca1-b3bf81a000b3', 'INV-073', 'Invoice', '04c29893-471f-493f-8333-d5404011480f', 'pending', 3800.00, 2300.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-22 19:39:14.218', '2026-06-22 19:39:46.835', NULL),
('894526fa-2fde-4737-80f4-cc50dc723744', 'INV-128', 'Invoice', '6afcde4a-9fba-4c37-8cbf-2522acea42c3', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-15 15:04:34.905', '2026-08-15 15:08:11.588', NULL),
('8a486446-102a-465f-a124-2428ecd1410e', 'INV-031', 'Invoice', 'cd34d0d6-b2ea-4ca4-b708-ba998d835bd2', 'paid', 5800.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-02 12:53:30.432', '2026-05-02 12:53:30.432', NULL),
('8f55cd28-8420-4b24-a350-656f6d4a14ce', 'INV-096', 'Invoice', '08c6a172-b067-4e09-99df-70d83d8747a2', 'paid', 3300.00, 1500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-24 15:02:34.580', '2026-07-24 15:02:34.580', NULL),
('90b1c863-7d23-4f5b-b7ad-cee3fda7e167', 'INV-075', 'Invoice', 'ad24ae56-3d54-4402-bc38-06852a4de81c', 'paid', 2200.00, 1300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-23 19:33:54.276', '2026-06-23 19:33:54.276', NULL),
('938b1bca-d260-4489-a298-c09aa24f59df', 'INV-119', 'Invoice', '9692c892-e812-43a8-9bea-769ba7d88898', 'paid', 3000.00, 1500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-13 17:10:29.265', '2026-08-13 17:10:29.265', NULL),
('a2492517-398c-4dd3-8585-146ad95de573', 'INV-090', 'Invoice', '0b9e998e-c48d-4104-bdf3-8cd0b5c74c6c', 'partial', 2200.00, 1500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-17 12:18:25.010', '2026-07-17 12:18:25.010', NULL),
('ae660ca9-fc9f-4343-b682-d498cffdd61e', 'INV-033', 'Invoice', '1573dca7-f4c9-48a2-980e-c3ae4b1b97cd', 'paid', 2000.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-09 17:40:47.528', '2026-05-09 17:40:47.528', NULL),
('af9fa1ab-81e3-4351-9d17-35dbef4bdf8d', 'INV-102', 'Invoice', '375cd8b5-cb53-43e5-a634-5fa86a9bca94', 'paid', 3900.00, 3900.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-29 15:51:40.990', '2026-07-29 15:51:40.990', NULL),
('b2e13441-b929-4fa5-b49c-1c174fb43eee', 'INV-044', 'Invoice', '2a537091-3309-4db3-b144-15542659ff3f', 'paid', 3300.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:24:26.951', '2026-05-18 15:24:26.951', NULL),
('b4906a2c-7522-4057-85e9-4e2829921db2', 'INV-132', 'Invoice', 'bdad62e5-b6ea-4f2e-9901-776b5a8bc569', 'partial', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-18 14:55:59.546', '2026-08-18 14:55:59.546', NULL),
('b582c072-ddd6-47a7-8a1b-d265c14489ab', 'INV-099', 'Invoice', '58690478-5efe-4ac6-a267-9bd6d1f1bf2a', 'paid', 3400.00, 3400.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-25 15:23:50.893', '2026-07-25 15:25:27.155', NULL),
('be06dd92-0120-4c52-b161-a0e1a51dbf39', 'INV-078', 'Invoice', '16844649-6e58-4f87-a30f-40dce733cc68', 'paid', 4000.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-26 13:26:44.914', '2026-06-26 13:26:44.914', NULL),
('bfe32dd6-d4c3-41fb-9a5b-d5f50b10466b', 'INV-105', 'Invoice', 'a1e69215-0c01-418f-b4a1-876d30b55184', 'partial', 4000.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-06 16:57:58.523', '2026-08-06 16:57:58.523', NULL),
('c049b50f-96aa-478e-b389-84ba31a487db', 'INV-066', 'Invoice', 'e32ecfd4-716e-4b9e-a83d-bc3af1a2eb73', 'paid', 2200.00, 2200.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-12 14:31:38.675', '2026-06-17 19:44:46.264', NULL),
('c3928d21-67da-4209-860b-2ad9471feea4', 'INV-071', 'Invoice', '432e0a19-a7aa-4f34-b4cb-3729ca734b31', 'paid', 2200.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-17 19:49:50.724', '2026-06-17 19:49:50.724', NULL),
('c46e801a-4bb8-4d54-bd51-364c356f1dba', 'INV-110', 'Invoice', '88e7d2de-5b40-45e8-8428-424a5c9df39b', 'paid', 3600.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-10 14:06:38.180', '2026-08-10 14:06:38.180', NULL),
('c675e3f1-9f45-4196-82ca-b46c88ffb763', 'INV-092', 'Invoice', '97d656e0-97c8-45b6-9d6a-f93f7e673cb2', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-18 20:27:59.815', '2026-07-18 20:27:59.815', NULL),
('cb1a68f1-5fe5-456c-9e65-a92ff31ec3a5', 'INV-057', 'Invoice', 'f767c0ec-4118-4516-9f49-3e24cad0883b', 'paid', 1600.00, 800.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-21 12:16:34.291', '2026-05-25 15:15:41.287', NULL),
('ccc09eff-b6b4-4f8e-9098-e9657c01ceb3', 'INV-103', 'Invoice', '7fbda382-8af9-43cb-a7ee-e099de027932', 'paid', 5000.00, 1000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-29 15:57:49.610', '2026-07-29 15:57:49.610', NULL),
('cde923de-a334-4bca-a3d0-e82382cddac1', 'INV-124', 'Invoice', 'd09e7bf6-bc2f-4c39-9566-7b92306a46dd', 'paid', 5800.00, 2000.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-14 15:34:20.172', '2026-08-14 15:35:21.223', NULL),
('ce084984-8644-4ede-8cf7-6ce77f2519cc', 'INV-040', 'Invoice', 'b6434218-974e-45f1-bedf-bb6a3754c09e', 'paid', 3800.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:15:53.521', '2026-05-18 15:15:53.521', NULL),
('d373205b-7b2c-43ad-b474-f4743530eb4b', 'INV-085', 'Invoice', 'f4f8c5f8-2bc0-4ba0-8f5a-fef092a4f719', 'partial', 2200.00, 1500.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-14 13:18:51.207', '2026-07-14 13:19:19.429', NULL),
('d4a6b2b5-24a7-44d7-a6e2-9a9960c755e2', 'INV-104', 'Invoice', '464262b1-c28f-483e-b7a2-3a0b96619966', 'paid', 3300.00, 1500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-01 16:35:36.512', '2026-08-01 16:35:36.512', NULL),
('d5bbb8cc-b26e-44ed-bc48-c7488f1f5474', 'INV-086', 'Invoice', '864b92a3-32a7-4976-afa1-46a8b28d80b8', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-14 13:22:58.251', '2026-07-14 13:22:58.251', NULL),
('d5de5be0-4373-4b14-adb0-3e5f94c25b63', 'INV-048', 'Invoice', '157fbb69-ed41-44ab-ad22-243a1e2c9d48', 'paid', 2100.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:42:36.688', '2026-05-18 15:42:36.688', NULL),
('d6e3e4f3-b7af-4965-99cd-b5443cc77e93', 'INV-046', 'Invoice', '5e5891d5-891e-4e3d-b7f0-ebcbf03fb444', 'paid', 2000.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:35:00.213', '2026-05-18 15:35:00.213', NULL),
('d892d25b-dbed-4d9e-97e0-7fb56559eddd', 'INV-061', 'Invoice', '5836057d-788c-4ff2-bcc5-0d1259c3f54d', 'paid', 3300.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-29 11:47:07.794', '2026-05-29 11:47:07.794', NULL),
('d9158a08-d9cd-47fe-abbb-44b53fb9971f', 'INV-114', 'Invoice', '40eaa194-e381-4b26-a481-a1f50fb17fc3', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-11 12:52:59.073', '2026-08-11 12:52:59.073', NULL),
('d9469e2f-31f2-4e48-a2b4-e995e0ec4428', 'INV-091', 'Invoice', '68ba1d96-dea8-46ff-a03d-e1ac709b5cd4', 'partial', 2200.00, 1500.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-17 12:22:09.086', '2026-07-17 12:22:09.086', NULL),
('da5ca177-039f-4d64-b2e2-1d17d46dd8b0', 'ADV-009', 'Invoice', '432e0a19-a7aa-4f34-b4cb-3729ca734b31', 'paid', 2200.00, 0.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-11 15:13:25.004', '2026-06-17 19:48:56.878', NULL),
('db605a4b-6253-42b1-9452-9e2f27a2cdd0', 'INV-053', 'Invoice', '26ea31c8-b3a3-47ce-afc7-b812735860c8', 'paid', 3800.00, 2300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-20 16:04:32.803', '2026-05-20 16:04:32.803', NULL),
('dce27b35-be1f-45fc-80ed-3a3dbe5e7313', 'INV-050', 'Invoice', 'c3c31846-5bb6-4811-9863-b14981745c68', 'paid', 2700.00, 1500.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-19 13:31:03.649', '2026-05-19 13:31:17.517', NULL),
('de0d43c8-f933-48ec-b67d-aa06f67049ca', 'INV-060', 'Invoice', 'c89977dd-6091-4cd0-a03d-bfac29b35134', 'paid', 3500.00, 2100.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-29 11:03:08.606', '2026-05-29 11:03:08.606', NULL),
('dec2aeb4-43a0-4aa4-8c8e-293b4efb954a', 'INV-127', 'Invoice', '944ad35b-5192-4ac5-b8a3-1638f7e916a3', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-15 15:01:41.493', '2026-08-15 15:01:41.493', NULL),
('dece287a-cd9b-41bd-be0d-17f59cfbd482', 'INV-079', 'Invoice', 'b23b2693-4d6d-43d5-b35f-3c2066f28a43', 'pending', 3500.00, 500.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-29 18:47:38.805', '2026-06-29 18:48:37.107', NULL),
('e07bd88a-7e9d-4bf8-9824-ed5159cc0654', 'INV-082', 'Invoice', 'a5d1dd42-d585-47d0-9490-af9a5958f658', 'paid', 3200.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-11 17:19:51.626', '2026-07-11 17:19:51.626', NULL),
('e397fe8f-a288-41a3-a20c-2c88febbdadf', 'INV-125', 'Invoice', '09414bd9-b360-41dd-a407-50c9b1fb9d3d', 'partial', 4100.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-14 17:08:23.718', '2026-08-14 17:08:23.718', NULL),
('e3d64393-bb98-429f-b462-8da0a22317a2', 'INV-063', 'Invoice', '4ae61567-79f9-4842-b231-557e1ea55f48', 'paid', 3600.00, 2200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-06 12:26:53.472', '2026-06-06 12:26:53.472', NULL),
('e9ca0d17-3072-403c-9e44-41b441f66410', 'INV-074', 'Invoice', 'e32ecfd4-716e-4b9e-a83d-bc3af1a2eb73', 'paid', 2200.00, 2200.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-23 19:14:49.631', '2026-07-08 14:11:30.876', NULL),
('ea301afa-fdb2-48fe-852a-d5efeec16a3b', 'INV-116', 'Invoice', '5bafac00-5f77-4456-ae68-edd2ad9f0625', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-12 17:05:37.081', '2026-08-12 17:05:37.081', NULL),
('eaff0c0a-1d54-4efb-bf2d-2450ab7c0036', 'INV-088', 'Invoice', '71977571-2205-4dea-9a09-0342fa5bf088', 'partial', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-17 10:49:48.510', '2026-07-17 10:49:48.510', NULL),
('eb7366a2-2e1e-4d8c-844a-449c3df2c8e9', 'INV-106', 'Invoice', 'f6682772-e378-432b-a8a2-53765bf95ba7', 'paid', 4100.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-08 16:07:20.645', '2026-08-08 16:07:20.645', NULL),
('f19f1d4f-146d-4b08-afc1-bdde99ae8674', 'INV-030', 'Invoice', 'af5abd1e-8a06-4172-997e-018f31dba463', 'pending', 3300.00, 0.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-04-30 14:38:15.344', '2026-04-30 14:40:06.277', NULL),
('f1b9c1b7-7f58-4b76-a122-1c4ae0b6d22a', 'ADV-016', 'Advance Payment', 'f3ca00e7-6872-4599-a0ce-89d7aba71ca3', 'partial', 4100.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-15 12:33:23.657', '2026-08-15 12:33:23.657', NULL),
('f65d96bb-68bd-4f5a-b123-b15aed5dd96c', 'INV-034', 'Invoice', 'ea06c6a6-b693-41b1-b874-e9959fde0d36', 'paid', 2800.00, 0.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-12 18:52:38.138', '2026-05-13 12:00:29.030', NULL),
('f7cbd4ca-423a-40d1-a92f-3e2c62c7cc32', 'INV-038', 'Invoice', '70d3dcd4-0377-41a2-98bc-f3b564728193', 'paid', 3300.00, 0.00, 0.00, 0.00, 0.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-18 15:12:08.133', '2026-05-18 15:12:29.230', NULL),
('f8fc441d-d38a-4e65-95f2-be71a8fc945d', 'INV-095', 'Invoice', '9d43fbc1-d441-45bd-af18-1a5bdac0705b', 'partial', 3200.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-07-23 17:36:08.441', '2026-07-23 17:36:08.441', NULL),
('fa2565d6-708d-4beb-824c-f3779b8ce250', 'INV-123', 'Invoice', '15e13924-7348-4b63-82dc-3c92ee23099e', 'paid', 3600.00, 2000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-14 15:17:45.551', '2026-08-14 15:17:45.551', NULL),
('fa6d790a-241a-43b7-9e9a-20e7f5505163', 'INV-065', 'Invoice', 'a2333e6d-b1ed-4be2-92ab-dc179c4f17c7', 'paid', 2200.00, 1000.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-09 12:35:33.656', '2026-06-09 12:35:33.656', NULL),
('faf0d938-201c-4403-9621-63493418d63b', 'INV-069', 'Invoice', '4ece479c-2f0e-43dc-9661-199b488a3c8c', 'paid', 1800.00, 0.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-06-17 18:09:31.082', '2026-06-17 18:09:31.082', NULL),
('feff3176-c65c-4004-8314-836323627269', 'INV-113', 'Invoice', 'a7958a02-0ac6-401c-96a4-0eb9e2565b69', 'paid', 2200.00, 1200.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-08-10 19:53:07.315', '2026-08-10 19:53:07.315', NULL),
('ffac67f0-6139-45c5-a641-13fba6ee783f', 'INV-052', 'Invoice', '3fc3f937-10c8-4d54-ae11-2282c0a59bcd', 'paid', 3800.00, 2300.00, 0.00, 0.00, 0.00, NULL, '113a558c-076f-11f1-8f59-6605f9942941', '2026-05-20 11:17:44.485', '2026-05-20 11:17:44.485', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` char(36) NOT NULL,
  `invoice_id` char(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `total_price` decimal(14,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `product_id` char(36) DEFAULT NULL,
  `scan_price` decimal(14,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_name`, `quantity`, `unit_price`, `total_price`, `created_at`, `updated_at`, `product_id`, `scan_price`) VALUES
('050e8de1-aff2-42f1-bc1e-b97c13951224', 'ce084984-8644-4ede-8cf7-6ce77f2519cc', 'Victor', 1, 3000.00, 3800.00, '2026-05-18 15:15:53.742', '2026-05-18 15:15:53.742', NULL, 800.00),
('05990a34-eb48-47bd-bf5c-fae5381ac712', '0e22a08a-5e34-4e24-b1d5-6ce0dc216b16', 'Gents V- strap', 1, 1300.00, 2100.00, '2026-05-18 15:33:44.791', '2026-05-18 15:33:44.791', NULL, 800.00),
('09157649-1330-4279-a06a-9f743d10d861', '60564936-29be-441b-b223-833241a3dda0', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-13 16:57:40.112', '2026-08-13 16:57:40.112', NULL, 800.00),
('092824e8-bb80-4ce1-816f-899801b2b01f', '1ab82607-aec1-4f22-b7d8-d5ea9242eeee', 'Superior', 1, 3300.00, 4100.00, '2026-08-18 13:46:27.784', '2026-08-18 13:46:27.784', NULL, 800.00),
('0d75a068-0c2f-437d-8f7d-1ec83dbca36c', 'c46e801a-4bb8-4d54-bd51-364c356f1dba', 'L 2015', 1, 2800.00, 3600.00, '2026-08-10 14:06:38.450', '2026-08-10 14:06:38.450', NULL, 800.00),
('0f2ce816-1da7-4304-a28f-403344c6745d', '4886445f-25aa-4ca0-a736-8b012f8d4a5d', 'Gents Slipper', 1, 2500.00, 2500.00, '2026-05-13 17:01:33.076', '2026-05-13 17:01:33.076', NULL, 0.00),
('15acf271-0bc1-40ba-88ab-518f887f2573', '0c14184f-987b-432a-a32f-e8dd73b0beba', 'Superior', 1, 3100.00, 3100.00, '2026-07-06 19:03:48.642', '2026-07-06 19:03:48.642', NULL, 0.00),
('17e68f77-f3b9-4e35-b7c9-ec01ebe6da18', '938b1bca-d260-4489-a298-c09aa24f59df', 'Superior', 1, 3000.00, 3000.00, '2026-08-13 17:10:29.521', '2026-08-13 17:10:29.521', NULL, 0.00),
('1cb56da0-a85e-4142-87c4-2c9d263e84fb', '24ae8be5-f960-43a4-ac8c-8ca67c70af78', 'Dora', 1, 3000.00, 3800.00, '2026-05-05 16:38:38.120', '2026-05-05 16:38:38.120', NULL, 800.00),
('1e4db2f1-aa70-4467-8cb6-96d7fc5917af', '1636c77b-4ae8-48f5-a7bf-a4d47c773048', 'Superior', 1, 3000.00, 3800.00, '2026-05-18 15:17:27.744', '2026-05-18 15:17:27.744', NULL, 800.00),
('1ee17bf8-90f4-4380-960a-793c3ee3adfb', 'eb7366a2-2e1e-4d8c-844a-449c3df2c8e9', 'Superior', 1, 3300.00, 4100.00, '2026-08-08 16:07:20.903', '2026-08-08 16:07:20.903', NULL, 800.00),
('1ef996c7-893f-4484-8118-c73994a1459e', '8512d78e-5594-46f3-bd94-bf3d04738dfc', 'insole kid', 1, 1200.00, 1800.00, '2026-05-30 11:47:30.980', '2026-05-30 11:47:30.980', NULL, 600.00),
('210fac06-394e-45b1-b649-a3df535a6a54', 'd9469e2f-31f2-4e48-a2b4-e995e0ec4428', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-17 12:22:09.210', '2026-07-17 12:22:09.210', NULL, 800.00),
('28c0904d-42b5-448e-9f34-c46678b4798c', 'ae660ca9-fc9f-4343-b682-d498cffdd61e', 'Ladies V-Strap', 1, 1200.00, 2000.00, '2026-05-09 17:40:47.787', '2026-05-09 17:40:47.787', NULL, 800.00),
('2e879853-2990-4c8c-8980-3545827f7066', 'f19f1d4f-146d-4b08-afc1-bdde99ae8674', 'Gents Slipper', 1, 2500.00, 3300.00, '2026-04-30 14:43:45.667', '2026-04-30 14:43:45.667', NULL, 800.00),
('30a061a0-70d3-4cbf-9d8c-d17c14361e2d', 'ea301afa-fdb2-48fe-852a-d5efeec16a3b', 'Gents V-Strap', 1, 1400.00, 2200.00, '2026-08-12 17:05:37.300', '2026-08-12 17:05:37.300', NULL, 800.00),
('30a5ba2e-8f18-4cde-828d-be902343c6d5', '31f950cc-5d9c-426f-8f00-332964c67aac', 'Dia', 1, 3000.00, 3800.00, '2026-05-19 14:20:02.728', '2026-05-19 14:20:02.728', NULL, 800.00),
('31d74916-88c6-46b6-b68c-43d37d6d848e', 'dece287a-cd9b-41bd-be0d-17f59cfbd482', 'Superior', 1, 3000.00, 3500.00, '2026-06-29 18:48:37.465', '2026-06-29 18:48:37.465', NULL, 500.00),
('34f3b09f-fdbe-41b3-bbec-9d0dd7857ca8', 'f8fc441d-d38a-4e65-95f2-be71a8fc945d', 'Milling Insole', 1, 2500.00, 3200.00, '2026-07-23 17:36:08.657', '2026-07-23 17:36:08.657', NULL, 700.00),
('3c3ddee2-68bf-4d12-9346-55dcd83b3f1b', 'e9ca0d17-3072-403c-9e44-41b441f66410', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-08 14:11:31.202', '2026-07-08 14:11:31.202', NULL, 800.00),
('3ee1731e-4bda-4bad-92ac-77f32b517cda', 'd9158a08-d9cd-47fe-abbb-44b53fb9971f', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-11 12:52:59.352', '2026-08-11 12:52:59.352', NULL, 800.00),
('3f278953-6de3-41ae-893b-c4d2a061dee5', '1e7e5e88-f59d-4207-8dda-5cf9fef7816a', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-12 18:46:49.394', '2026-08-12 18:46:49.394', NULL, 800.00),
('3f646a4f-fb8b-4a53-8074-da490678818c', '69ef5097-5bc3-423d-83c0-2e026bc8c946', 'L 2015', 1, 2800.00, 3600.00, '2026-08-10 19:46:18.047', '2026-08-10 19:46:18.047', NULL, 800.00),
('403f21f6-08f0-4a2f-a636-b4c0edc83e4b', '7252b406-6126-4624-84c2-6572735d0f01', 'AFO', 1, 4000.00, 4800.00, '2026-05-21 14:01:55.913', '2026-05-21 14:01:55.913', NULL, 800.00),
('4332aec1-388c-4561-aac0-bb9cc3653453', '451d088e-c18c-4ac2-8fbc-70f8a924a513', 'Superior', 1, 3000.00, 3500.00, '2026-05-18 15:08:33.629', '2026-05-18 15:08:33.629', NULL, 500.00),
('4503b179-9fc5-41d0-8bcb-8ab4d4238b70', 'f65d96bb-68bd-4f5a-b123-b15aed5dd96c', 'Milling Insole', 1, 2000.00, 2800.00, '2026-05-13 12:00:29.245', '2026-05-13 12:00:29.245', NULL, 800.00),
('473fe9bc-769b-4017-82c2-267ed30f1096', '90b1c863-7d23-4f5b-b7ad-cee3fda7e167', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-06-23 19:33:54.507', '2026-06-23 19:33:54.507', NULL, 800.00),
('47e9b31f-3bbe-4a9f-b647-331b5158bde4', '57fefae8-de0b-434b-b1e4-ef2263a4c480', 'Superior', 1, 3200.00, 4000.00, '2026-06-22 19:24:23.197', '2026-06-22 19:24:23.197', NULL, 800.00),
('49100740-aa81-42fc-b3b4-7e061ef0b304', '04b2fdc3-9e9e-4389-b782-84063db3728f', 'Ladies V-Strap', 1, 800.00, 1600.00, '2026-04-09 11:18:33.330', '2026-04-09 11:18:33.330', NULL, 800.00),
('4bc0aaf2-99ca-40b4-b3ec-e13b43919ef3', 'fa6d790a-241a-43b7-9e9a-20e7f5505163', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-06-09 12:35:33.883', '2026-06-09 12:35:33.883', NULL, 800.00),
('4d930cea-ec38-4149-8663-ccd3703ce5d5', 'cb1a68f1-5fe5-456c-9e65-a92ff31ec3a5', 'Insole', 1, 800.00, 1600.00, '2026-05-25 15:15:41.500', '2026-05-25 15:15:41.500', NULL, 800.00),
('51a281c2-7758-4f90-a0ef-e87c9fb20bd7', 'eaff0c0a-1d54-4efb-bf2d-2450ab7c0036', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-17 10:49:48.727', '2026-07-17 10:49:48.727', NULL, 800.00),
('53379b5a-1c8d-41b0-b341-5c8f97189057', 'd4a6b2b5-24a7-44d7-a6e2-9a9960c755e2', 'Superior', 1, 3300.00, 3300.00, '2026-08-01 16:35:36.755', '2026-08-01 16:35:36.755', NULL, 0.00),
('5469e9ac-a631-41e2-9d59-9f7239ec21eb', 'f7cbd4ca-423a-40d1-a92f-3e2c62c7cc32', 'Gents RV Strap', 1, 2500.00, 3300.00, '2026-05-18 15:12:29.486', '2026-05-18 15:12:29.486', NULL, 800.00),
('553a16c8-3ea5-4346-a725-66c088de0aff', 'b4906a2c-7522-4057-85e9-4e2829921db2', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-18 14:55:59.796', '2026-08-18 14:55:59.796', NULL, 800.00),
('55b181a9-48b5-4b7a-aaf4-3ff30da46715', '10ff7012-8d62-43f3-b62a-c562112f01e6', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-20 18:44:27.590', '2026-07-20 18:44:27.590', NULL, 800.00),
('594ab6c6-7272-4b3d-9191-14ba01131d77', 'e3d64393-bb98-429f-b462-8da0a22317a2', 'Gents Slipper', 1, 2800.00, 3600.00, '2026-06-06 12:26:53.695', '2026-06-06 12:26:53.695', NULL, 800.00),
('59dfe95f-943a-405a-bafd-391a77fb1890', 'e07bd88a-7e9d-4bf8-9824-ed5159cc0654', 'Superior', 1, 3200.00, 3200.00, '2026-07-11 17:19:51.837', '2026-07-11 17:19:51.837', NULL, 0.00),
('5abf5f80-c7fd-4070-8d8b-52dc9b0e4568', '41f61f88-df55-4462-a32b-16d3343c908f', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-08 17:29:43.908', '2026-08-08 17:29:43.908', NULL, 800.00),
('5b91db72-d72c-4fee-992b-a31526cc0bd9', '3724929f-b18e-46f4-a135-a3f6b8332924', '1012', 1, 2800.00, 3600.00, '2026-08-15 14:58:46.803', '2026-08-15 14:58:46.803', NULL, 800.00),
('5e57beda-f493-4ade-b96c-a633302ccfb9', '04b2fdc3-9e9e-4389-b782-84063db3728f', 'Mens Flip Flop', 1, 2500.00, 3300.00, '2026-04-09 11:18:32.061', '2026-04-09 11:18:32.061', NULL, 800.00),
('6092d4cd-096b-4b5d-9174-d7ed6cbe0c07', '205815ed-332e-4623-aba7-783050bed736', 'Victor', 1, 3300.00, 4100.00, '2026-07-13 16:06:35.247', '2026-07-13 16:06:35.247', NULL, 800.00),
('61ba5d1f-deb9-41e8-8bd9-d30629e5db52', 'd373205b-7b2c-43ad-b474-f4743530eb4b', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-14 13:19:19.764', '2026-07-14 13:19:19.764', NULL, 800.00),
('62eb9643-3bbe-4e4e-8289-b04b94aba9e7', '04b2fdc3-9e9e-4389-b782-84063db3728f', 'Dora', 1, 3000.00, 3800.00, '2026-04-09 11:18:32.823', '2026-04-09 11:18:32.823', NULL, 800.00),
('678b881a-6354-428e-a75c-3a6048fa6c67', '65f7184a-b0f2-4f4e-b3b5-afe02daa96f9', 'Ladies V-Strap', 1, 1400.00, 2100.00, '2026-06-26 11:41:03.094', '2026-06-26 11:41:03.094', NULL, 700.00),
('74f899ed-0c96-4e87-b08d-4758f3d094e5', 'f1b9c1b7-7f58-4b76-a122-1c4ae0b6d22a', 'Superior', 1, 3300.00, 4100.00, '2026-08-15 12:33:23.922', '2026-08-15 12:33:23.922', NULL, 800.00),
('7692b478-4356-4833-bdca-635ba5ee5f47', 'e397fe8f-a288-41a3-a20c-2c88febbdadf', 'Superior', 1, 3300.00, 4100.00, '2026-08-14 17:08:24.204', '2026-08-14 17:08:24.204', NULL, 800.00),
('76c08673-6d34-4f9a-9f12-1cc72885bc87', 'ffac67f0-6139-45c5-a641-13fba6ee783f', 'Superior Strapped', 1, 3000.00, 3800.00, '2026-05-20 11:17:45.520', '2026-05-20 11:17:45.520', NULL, 800.00),
('773939a5-843e-46e7-8388-cf930723dd50', '43ad3181-0186-4857-a195-6be6bf6cfa0a', 'Gents Slipper', 1, 2500.00, 3300.00, '2026-05-18 14:56:27.395', '2026-05-18 14:56:27.395', NULL, 800.00),
('785106ba-fa6d-4194-bc8f-3203777fbae7', '0b1ad458-09a9-41d6-a273-60b0da71a922', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-28 17:40:13.683', '2026-07-28 17:40:13.683', NULL, 800.00),
('7e3ddf20-6c20-47c6-8d23-cee70f28aedb', 'a2492517-398c-4dd3-8585-146ad95de573', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-17 12:18:25.194', '2026-07-17 12:18:25.194', NULL, 800.00),
('8139a7dc-9794-43cf-9ef8-68b45c62ac70', '675c0cdf-f1e8-4ffb-980a-487eee06ce60', 'Superior', 1, 3300.00, 4100.00, '2026-08-18 13:51:44.720', '2026-08-18 13:51:44.720', NULL, 800.00),
('83f7d739-d91f-4004-82c1-9d7cea41cff8', 'af9fa1ab-81e3-4351-9d17-35dbef4bdf8d', 'Superior', 1, 3300.00, 3900.00, '2026-07-29 15:51:41.232', '2026-07-29 15:51:41.232', NULL, 600.00),
('85189f2d-a2fd-41fe-9f46-27f8afb7b13c', 'be06dd92-0120-4c52-b161-a0e1a51dbf39', 'Superior Strapped', 1, 4000.00, 4000.00, '2026-06-26 13:26:45.132', '2026-06-26 13:26:45.132', NULL, 0.00),
('853de352-346e-4097-8447-dd0c4893252e', '4a264a30-6a91-4eac-b973-7153c7597557', 'Gents V-Strap', 12, 130.00, 1960.00, '2026-05-03 14:23:52.717', '2026-05-03 14:23:52.717', NULL, 400.00),
('86d37714-10fe-40da-9bf0-6601be35b3ad', '894526fa-2fde-4737-80f4-cc50dc723744', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-15 15:08:12.196', '2026-08-15 15:08:12.196', NULL, 800.00),
('88295758-46ef-4100-b728-4851cba19226', '2d75a70f-0c8f-4715-9e42-0b4b77167c88', '2018', 1, 2800.00, 3600.00, '2026-08-14 15:14:59.137', '2026-08-14 15:14:59.137', NULL, 800.00),
('8b2db8dd-2c35-426e-9c74-e5ea03c7701e', 'feff3176-c65c-4004-8314-836323627269', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-10 19:53:07.499', '2026-08-10 19:53:07.499', NULL, 800.00),
('8f73bb01-06df-42a2-90de-39bc8da747ef', 'd6e3e4f3-b7af-4965-99cd-b5443cc77e93', 'Ladies V-Strap', 1, 1200.00, 2000.00, '2026-05-18 15:35:00.417', '2026-05-18 15:35:00.417', NULL, 800.00),
('9b4b4367-b823-48f0-9560-03240e2862b3', '8f55cd28-8420-4b24-a350-656f6d4a14ce', 'Milling Insole', 1, 2500.00, 3300.00, '2026-07-24 15:02:34.812', '2026-07-24 15:02:34.812', NULL, 800.00),
('9bfed114-21c0-4d6e-a2d7-c8862970f8cc', '8a486446-102a-465f-a124-2428ecd1410e', 'Gents RV Strap', 2, 2500.00, 5800.00, '2026-05-02 12:53:31.808', '2026-05-02 12:53:31.808', NULL, 800.00),
('9fcba1a1-93ad-4f07-8c77-865f0f297674', '5f641bc6-ac82-48cb-9e86-9bad5f423424', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-28 17:37:55.392', '2026-07-28 17:37:55.392', NULL, 800.00),
('a005db63-481e-495b-8363-50ff23d5ffba', '4eb951d3-05c7-4c30-8387-fa6e21734d61', 'L-2011', 1, 3100.00, 3900.00, '2026-08-17 16:05:44.367', '2026-08-17 16:05:44.367', NULL, 800.00),
('a0a96c4c-2a47-4569-8c01-7c02cb988421', 'cde923de-a334-4bca-a3d0-e82382cddac1', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-14 15:35:22.087', '2026-08-14 15:35:22.087', NULL, 800.00),
('a678984b-2b13-45b3-9065-162789ed864e', 'c675e3f1-9f45-4196-82ca-b46c88ffb763', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-18 20:28:00.061', '2026-07-18 20:28:00.061', NULL, 800.00),
('a91f9b79-df72-41fb-8ab7-f88860655b1a', '66274354-54e4-4b58-a6c4-8d38cf795055', 'Mens Flip Flop', 1, 2800.00, 3600.00, '2026-06-08 11:37:30.779', '2026-06-08 11:37:30.779', NULL, 800.00),
('ab00f239-6b13-4f00-bbc1-1a6d3d4253c4', 'b2e13441-b929-4fa5-b49c-1c174fb43eee', 'Gents Slipper', 1, 2500.00, 3300.00, '2026-05-18 15:24:27.191', '2026-05-18 15:24:27.191', NULL, 800.00),
('ab1be0f5-eeaf-45a0-a7da-4db8d0d43d73', 'de0d43c8-f933-48ec-b67d-aa06f67049ca', 'Lolita', 1, 2800.00, 3500.00, '2026-05-29 11:03:08.815', '2026-05-29 11:03:08.815', NULL, 700.00),
('ab8aacd7-2d4a-49ea-98a3-17424bea468e', 'c049b50f-96aa-478e-b389-84ba31a487db', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-06-17 19:44:46.603', '2026-06-17 19:44:46.603', NULL, 800.00),
('ac91fcc7-1bb3-4fb6-837a-7b33bee2bb6b', 'd5bbb8cc-b26e-44ed-bc48-c7488f1f5474', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-07-14 13:22:58.466', '2026-07-14 13:22:58.466', NULL, 800.00),
('acb05fed-9d13-4c83-b9c1-9dfd0cfddb63', '44cb0c70-9348-45ec-b785-7a39d574ce69', 'Mens Flip Flop', 1, 2750.00, 3550.00, '2026-06-01 17:30:40.279', '2026-06-01 17:30:40.279', NULL, 800.00),
('b45a7f44-5fd3-4fe9-955e-3438dba0e901', '1c14bc98-71fa-4ec2-9650-04de847102ca', 'Superior Strapped', 1, 3300.00, 4100.00, '2026-06-13 17:48:53.903', '2026-06-13 17:48:53.903', NULL, 800.00),
('b833771c-0900-43f5-987b-da24a58c1bee', 'bfe32dd6-d4c3-41fb-9a5b-d5f50b10466b', 'Superior', 1, 3200.00, 4000.00, '2026-08-06 16:57:58.759', '2026-08-06 16:57:58.759', NULL, 800.00),
('be07581d-737d-40b2-abea-cd7ea74e78e7', '68105bfc-ff06-40b0-b67a-294fb278170e', 'insole', 1, 1000.00, 1600.00, '2026-06-01 13:36:54.327', '2026-06-01 13:36:54.327', NULL, 600.00),
('bf6760ea-cb90-4b11-8869-b7804b3e04ee', 'faf0d938-201c-4403-9621-63493418d63b', 'insole', 1, 1200.00, 1800.00, '2026-06-17 18:09:31.289', '2026-06-17 18:09:31.289', NULL, 600.00),
('c5f35cd3-470b-48cf-a770-7a76e47f2755', 'dce27b35-be1f-45fc-80ed-3a3dbe5e7313', 'Milling Insole', 1, 2000.00, 2700.00, '2026-05-19 13:31:17.782', '2026-05-19 13:31:17.782', NULL, 700.00),
('c7d3775b-a76d-42af-b1e1-cb7da81c2209', '85623e40-85b0-436b-85f6-18710ad9b2e4', 'L 2015', 1, 2080.00, 2880.00, '2026-07-20 12:42:14.819', '2026-07-20 12:42:14.819', NULL, 800.00),
('cc503109-07a5-4256-9430-dfb87a44f2fa', 'cde923de-a334-4bca-a3d0-e82382cddac1', '2018', 1, 2800.00, 3600.00, '2026-08-14 15:35:21.840', '2026-08-14 15:35:21.840', NULL, 800.00),
('cdb9d971-bb81-4b92-885b-682b49136e12', 'd5de5be0-4373-4b14-adb0-3e5f94c25b63', 'Gents V- strap', 1, 1300.00, 2100.00, '2026-05-18 15:42:36.894', '2026-05-18 15:42:36.894', NULL, 800.00),
('d51c5297-ac56-4844-968c-5c65526068bd', '4a6092a4-4f15-4736-b15e-fae2577c2e5a', '10212', 1, 2800.00, 3600.00, '2026-08-10 14:37:35.732', '2026-08-10 14:37:35.732', NULL, 800.00),
('d55e25cd-bbe6-4693-9c24-1378ed7855af', 'da5ca177-039f-4d64-b2e2-1d17d46dd8b0', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-06-17 19:48:58.001', '2026-06-17 19:48:58.001', NULL, 800.00),
('d56425a5-7a34-4d95-8689-138d98a4e1f0', 'c3928d21-67da-4209-860b-2ad9471feea4', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-06-17 19:49:51.068', '2026-06-17 19:49:51.068', NULL, 800.00),
('de24b540-c3f9-43f3-abb6-2401adb80639', '45931263-7f8f-4cd1-83df-d819b25ee88b', 'Superior', 1, 3000.00, 3800.00, '2026-05-20 16:42:54.285', '2026-05-20 16:42:54.285', NULL, 800.00),
('de4d8cfa-9735-4c55-83dd-ddc0220ad31e', '72c7a800-00db-4e48-9904-422a3a5c0d17', 'Ladies V-Strap', 1, 1200.00, 2000.00, '2026-05-18 15:36:56.083', '2026-05-18 15:36:56.083', NULL, 800.00),
('de635b53-a65e-42ed-b7ad-f1bfceb063b0', 'fa2565d6-708d-4beb-824c-f3779b8ce250', '2013', 1, 2800.00, 3600.00, '2026-08-14 15:17:45.813', '2026-08-14 15:17:45.813', NULL, 800.00),
('de8a977a-e398-448e-a08b-2bc8c3a8174a', '42141180-ec81-48a1-805e-bd5f53d5dc39', 'Dora', 1, 3000.00, 3800.00, '2026-05-23 18:57:41.621', '2026-05-23 18:57:41.621', NULL, 800.00),
('e1467ac2-0596-4c98-8d04-e6c56999c317', 'b582c072-ddd6-47a7-8a1b-d265c14489ab', 'L 2015', 1, 2800.00, 3400.00, '2026-07-25 15:25:27.522', '2026-07-25 15:25:27.522', NULL, 600.00),
('e83552aa-4f18-4814-8459-6f18a11fc4d7', '773e1bf9-b818-4f6e-941b-778edb2f7789', 'Gents RV Strap', 1, 2400.00, 3200.00, '2026-05-13 18:19:32.227', '2026-05-13 18:19:32.227', NULL, 800.00),
('eaa917cc-6190-4888-92f7-7629b89f643b', 'ccc09eff-b6b4-4f8e-9098-e9657c01ceb3', 'AFO', 1, 4500.00, 5000.00, '2026-07-29 15:57:50.163', '2026-07-29 15:57:50.163', NULL, 500.00),
('ed35a8de-1d29-40b2-9cff-8447724aec44', 'db605a4b-6253-42b1-9452-9e2f27a2cdd0', 'Dia', 1, 3000.00, 3800.00, '2026-05-20 16:04:33.019', '2026-05-20 16:04:33.019', NULL, 800.00),
('ee34a0c1-a256-42ee-a656-0170b3578f20', 'd892d25b-dbed-4d9e-97e0-7fb56559eddd', 'Mens Flip Flop', 1, 2500.00, 3300.00, '2026-05-29 11:47:08.016', '2026-05-29 11:47:08.016', NULL, 800.00),
('ee7df303-10b0-486a-8036-c50af7208d83', '580e3f61-a670-4c96-8de8-89368cdc84d7', 'L 2015', 1, 2800.00, 3600.00, '2026-07-16 14:35:27.003', '2026-07-16 14:35:27.003', NULL, 800.00),
('f8764eb9-feb0-4115-9435-24ea5dadc0af', '581f8bca-dc7c-45f4-b939-525dea88c6ed', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-06-23 19:33:55.356', '2026-06-23 19:33:55.356', NULL, 800.00),
('f8b59ba4-3e24-4250-ad81-e572864f3323', 'dec2aeb4-43a0-4aa4-8c8e-293b4efb954a', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-15 15:01:41.858', '2026-08-15 15:01:41.858', NULL, 800.00),
('f8b8511c-14ad-45a7-a1bb-78c5d814537c', '875afd78-51f4-47fc-8ca1-b3bf81a000b3', 'Dia', 1, 3000.00, 3800.00, '2026-06-22 19:39:47.218', '2026-06-22 19:39:47.218', NULL, 800.00),
('fad43c2e-b2a5-4b21-be5f-459ecbe38606', '80550230-43cc-4a87-8e98-4cdfd8662776', 'Ladies V-Strap', 1, 1400.00, 2200.00, '2026-08-08 18:04:45.400', '2026-08-08 18:04:45.400', NULL, 800.00),
('ff07929e-6899-4001-b12c-0fe6d8751169', '4015862b-4102-4345-a7b0-b9c722a9611c', 'Ladies V-Strap', 1, 1200.00, 2000.00, '2026-05-20 17:34:14.609', '2026-05-20 17:34:14.609', NULL, 800.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `invoice_id` char(36) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `description`) VALUES
(1, 'Ladies V-Strap', 1400.00, 'Non leather'),
(2, 'Gents V-Strap', 1500.00, 'Non leather'),
(3, 'Superior', 3300.00, NULL),
(4, 'Superior Strapped', 3300.00, NULL),
(5, 'Victor', 3300.00, NULL),
(6, 'Rover', 3300.00, NULL),
(7, 'Gents Slipper', 2800.00, NULL),
(8, 'Mens Flip Flop', 2800.00, NULL),
(10, 'Gents RV Strap', 2800.00, NULL),
(11, 'Dora', 3300.00, NULL),
(12, 'Silky', 3300.00, NULL),
(13, 'Vagai', 3300.00, NULL),
(14, 'Lolita', 2800.00, NULL),
(15, 'Ladies RV Strap', 2800.00, NULL),
(16, 'Dia', 3100.00, NULL),
(17, 'Rocker Bottom', 3400.00, NULL),
(18, 'Wound Slipper', 3600.00, NULL),
(19, 'Temple Socks', 800.00, NULL),
(20, 'Milling Insole', 3000.00, NULL),
(23, 'test', 345.00, 'test'),
(24, 'L-2011', 3300.00, NULL),
(25, 'L 2015', 2800.00, NULL),
(26, 'AFO', 4500.00, NULL),
(27, '1012', 2800.00, NULL),
(28, '2018', 2800.00, NULL),
(29, '2013', 2800.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stock_items`
--

CREATE TABLE `stock_items` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_logs`
--

CREATE TABLE `stock_logs` (
  `id` char(36) NOT NULL,
  `stock_item_id` char(36) NOT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_id` char(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `store_name` varchar(255) DEFAULT 'FootWear Pro',
  `store_address` mediumtext DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `office_phone` varchar(50) DEFAULT NULL,
  `gst_percent` decimal(5,2) DEFAULT 18.00,
  `gst_number` varchar(50) DEFAULT NULL,
  `logo_url` longtext DEFAULT NULL,
  `theme` enum('light','dark') DEFAULT 'light',
  `theme_color` varchar(50) DEFAULT 'blue',
  `language` varchar(10) DEFAULT 'en',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `store_name`, `store_address`, `phone`, `office_phone`, `gst_percent`, `gst_number`, `logo_url`, `theme`, `theme_color`, `language`, `created_at`, `updated_at`, `deleted_at`) VALUES
('113a558c-076f-11f1-8f59-6605f9942941', 'floatwalktiruppur@gmail.com', '$2b$12$blcv5RyjIBBiU7wMVHMHze4KguQQ4A/GxhiTNiqbeHXQjYtOGvNvO', 'Praveen', 'ADMIN', 'ACTIVE', 'Float Walk', 'SKD’s Meenachi Complex, Old LG Showroom Opposite , 60 Feet Road, Kumar Nagar(East), Tiruppur - 641 603.', '8438030401', '8300305402', 18.00, '', '/uploads/logos/902827b0-d63e-4072-86ae-050ddeadac5a.jpg', 'light', 'blue', 'en', '2026-02-13 14:43:28.523', '2026-07-16 14:38:22.501', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `web_contact_enquiries`
--

CREATE TABLE `web_contact_enquiries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `service` varchar(150) NOT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','contacted','completed','cancelled') NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_customer_appointments`
--

CREATE TABLE `web_customer_appointments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `service` varchar(150) NOT NULL,
  `preferred_date` date NOT NULL,
  `preferred_time` time NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  `confirmation_method` enum('phone','whatsapp','both') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_customer_testimonials`
--

CREATE TABLE `web_customer_testimonials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `testimonial` text NOT NULL,
  `service` varchar(150) DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_gallery_media`
--

CREATE TABLE `web_gallery_media` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `media_id` varchar(150) NOT NULL,
  `type` enum('image','instagram','youtube') NOT NULL,
  `title` varchar(255) NOT NULL,
  `caption` text DEFAULT NULL,
  `src` varchar(500) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `poster` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_services_dropdown`
--

CREATE TABLE `web_services_dropdown` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `code_sequences`
--
ALTER TABLE `code_sequences`
  ADD PRIMARY KEY (`prefix`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_customers_mobile` (`mobile`),
  ADD KEY `idx_customers_deleted` (`deleted_at`),
  ADD KEY `idx_customers_name` (`name`),
  ADD KEY `idx_customers_email` (`email`),
  ADD KEY `idx_customers_created_at` (`created_at`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_expenses_date` (`expense_date`),
  ADD KEY `idx_expenses_deleted` (`deleted_at`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_invoices_customer` (`customer_id`),
  ADD KEY `idx_invoices_status` (`status`),
  ADD KEY `idx_invoices_created` (`created_at`),
  ADD KEY `idx_invoices_deleted` (`deleted_at`),
  ADD KEY `idx_invoices_created_by` (`created_by`),
  ADD KEY `idx_invoices_updated_at` (`updated_at`),
  ADD KEY `idx_invoices_customer_status` (`customer_id`,`status`),
  ADD KEY `idx_invoices_status_created` (`status`,`created_at`),
  ADD KEY `idx_invoices_customer_created` (`customer_id`,`created_at`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_items_invoice` (`invoice_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_ibfk_1` (`invoice_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_products_name` (`name`);

--
-- Indexes for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`);

--
-- Indexes for table `stock_logs`
--
ALTER TABLE `stock_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_item_id` (`stock_item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_deleted` (`deleted_at`);

--
-- Indexes for table `web_contact_enquiries`
--
ALTER TABLE `web_contact_enquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_service` (`service`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_preferred_date` (`preferred_date`);

--
-- Indexes for table `web_customer_appointments`
--
ALTER TABLE `web_customer_appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_service` (`service`),
  ADD KEY `idx_appointment_date` (`preferred_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `web_customer_testimonials`
--
ALTER TABLE `web_customer_testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_published` (`is_published`),
  ADD KEY `idx_review_date` (`review_date`);

--
-- Indexes for table `web_gallery_media`
--
ALTER TABLE `web_gallery_media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_media_id` (`media_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_active_order` (`is_active`,`sort_order`);

--
-- Indexes for table `web_services_dropdown`
--
ALTER TABLE `web_services_dropdown`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_service_name` (`service_name`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `web_contact_enquiries`
--
ALTER TABLE `web_contact_enquiries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_customer_appointments`
--
ALTER TABLE `web_customer_appointments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_customer_testimonials`
--
ALTER TABLE `web_customer_testimonials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_gallery_media`
--
ALTER TABLE `web_gallery_media`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_services_dropdown`
--
ALTER TABLE `web_services_dropdown`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_logs`
--
ALTER TABLE `stock_logs`
  ADD CONSTRAINT `stock_logs_ibfk_1` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
