-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: MYSQL1003.site4now.net
-- Generation Time: Nov 30, 2025 at 09:17 PM
-- Server version: 8.4.5
-- PHP Version: 8.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_abad59_hms`
--

-- --------------------------------------------------------

--
-- Table structure for table `acc_agent_group`
--

CREATE TABLE `acc_agent_group` (
  `acc_agent_id` int NOT NULL,
  `acc_branch` int NOT NULL,
  `acc_agent_code` varchar(255) NOT NULL,
  `acc_agent_serial` int NOT NULL,
  `acc_agent_name` varchar(255) NOT NULL,
  `acc_agent_group_id` int NOT NULL,
  `group_serial` int NOT NULL,
  `acc_agent_ct_person` varchar(255) DEFAULT NULL,
  `acc_agent_group` int NOT NULL,
  `buy_agent_name` varchar(255) DEFAULT NULL,
  `acc_agent_address` longtext,
  `acc_agent_city` varchar(255) DEFAULT NULL,
  `acc_agent_state` varchar(255) DEFAULT NULL,
  `acc_agent_sate_code` varchar(25) DEFAULT NULL,
  `acc_agent_phone` varchar(50) DEFAULT NULL,
  `acc_mobile` varchar(255) NOT NULL,
  `acc_email` varchar(255) NOT NULL,
  `acc_agent_fax` varchar(50) DEFAULT NULL,
  `acc_agent_open` float DEFAULT NULL,
  `acc_agent_cr_db` varchar(50) DEFAULT NULL,
  `acc_agent_gstin` varchar(255) DEFAULT NULL,
  `acc_agent_cst` varchar(255) DEFAULT NULL,
  `acc_agent_lst` varchar(255) DEFAULT NULL,
  `acc_ag_tin` varchar(255) DEFAULT NULL,
  `acc_agent_tds` double DEFAULT NULL,
  `acc_agent_pan` varchar(255) DEFAULT NULL,
  `acc_agent_user` int NOT NULL,
  `adharno` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '0',
  `acc_commission` varchar(255) DEFAULT NULL,
  `acc_tds` int NOT NULL,
  `ac_paytrem` varchar(255) DEFAULT NULL,
  `acc_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `acc_agent_group`
--

INSERT INTO `acc_agent_group` (`acc_agent_id`, `acc_branch`, `acc_agent_code`, `acc_agent_serial`, `acc_agent_name`, `acc_agent_group_id`, `group_serial`, `acc_agent_ct_person`, `acc_agent_group`, `buy_agent_name`, `acc_agent_address`, `acc_agent_city`, `acc_agent_state`, `acc_agent_sate_code`, `acc_agent_phone`, `acc_mobile`, `acc_email`, `acc_agent_fax`, `acc_agent_open`, `acc_agent_cr_db`, `acc_agent_gstin`, `acc_agent_cst`, `acc_agent_lst`, `acc_ag_tin`, `acc_agent_tds`, `acc_agent_pan`, `acc_agent_user`, `adharno`, `status`, `acc_commission`, `acc_tds`, `ac_paytrem`, `acc_entrydate`) VALUES
(1, 1, '', 0, '', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '', '0', NULL, 0, NULL, '2025-09-12 15:28:54'),
(2, 1, 'DR1', 1, 'Dr. Dolly Smith', 1, 1, '', 0, NULL, '***', '', '', '', NULL, '***', '***', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-09-12 15:28:54'),
(3, 1, 'DR2', 2, 'Dr. Jacksons', 1, 2, '', 0, NULL, '****', '', '', '', NULL, '1234567890', 'abcd@gmail.com', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-09-12 15:28:54'),
(4, 1, 'DR3', 3, 'Dr Anand', 1, 3, '', 0, NULL, '***', '', '', '', NULL, '***', '***', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-09-20 15:50:34'),
(5, 1, 'DR4', 4, 'Fela Kamal', 1, 4, '', 0, NULL, '123 Street 1, Nairobi Kenya', '', '', '', NULL, '', 'brigitashirima@gmail.com', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-09-20 18:41:17'),
(6, 2, 'DR5', 5, 'Khalid', 1, 5, '', 0, NULL, 'Pakistan', '', '', '', NULL, '0565456464', 'Amjid@yahoo.com', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-10-27 03:48:27'),
(7, 2, 'DR6', 6, 'Khalid', 1, 6, '', 0, NULL, 'Pakistan', '', '', '', NULL, '0565456464', 'Amjid@yahoo.com', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-10-27 03:52:01'),
(8, 1, 'DR7', 7, 'dr aa', 1, 7, '', 0, NULL, 'Pakistan', '', '', '', NULL, '1111', 'aa@', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-10-31 12:16:14'),
(9, 8, 'DR8', 8, 'Doctor1', 1, 8, '', 0, NULL, 'Pak', '', '', '', NULL, '11', 'aa', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-11-11 08:16:53'),
(10, 8, 'DR9', 9, 'Doctor2', 1, 9, '', 0, NULL, 'Pak', '', '', '', NULL, '11', 'aa', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-11-11 08:23:31'),
(11, 11, 'DR10', 10, 'Dr. Akram Ansari', 1, 10, '', 0, NULL, '**', '', '', '', NULL, '**', '**', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, '', 0, '', '0', NULL, 0, NULL, '2025-11-11 19:57:46');

-- --------------------------------------------------------

--
-- Table structure for table `acc_group`
--

CREATE TABLE `acc_group` (
  `acc_grp_id` int NOT NULL,
  `acc_grp_name` varchar(255) NOT NULL,
  `group_suffix` varchar(30) NOT NULL,
  `menu_name` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `acc_group`
--

INSERT INTO `acc_group` (`acc_grp_id`, `acc_grp_name`, `group_suffix`, `menu_name`, `label`) VALUES
(1, 'Doctor', 'DR', 'Doctor List', 'doctor');

-- --------------------------------------------------------

--
-- Table structure for table `addonsplan`
--

CREATE TABLE `addonsplan` (
  `adp_id` int NOT NULL,
  `adp_sbcp_id` int NOT NULL,
  `adp_plan_id` int NOT NULL,
  `adp_plan_price` decimal(25,2) NOT NULL,
  `adp_staff` int NOT NULL,
  `adp_location` int NOT NULL,
  `adp_feature_type` int NOT NULL,
  `adp_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addonsplan`
--

INSERT INTO `addonsplan` (`adp_id`, `adp_sbcp_id`, `adp_plan_id`, `adp_plan_price`, `adp_staff`, `adp_location`, `adp_feature_type`, `adp_date`) VALUES
(2, 1, 6, 1000.00, 0, 2, 2, '2025-10-27 12:43:13'),
(3, 9, 6, 1000.00, 0, 2, 2, '2025-10-31 22:37:18');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int NOT NULL,
  `admin_branch` int NOT NULL,
  `role` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `mobile_no` varchar(50) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `admin_status` int NOT NULL,
  `registration_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ad_other` int NOT NULL,
  `admin_onof` int NOT NULL COMMENT '0=Offline,1=Online',
  `admin_default` int NOT NULL,
  `admin_subcplan` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_branch`, `role`, `username`, `password`, `name`, `gender`, `mobile_no`, `email_id`, `admin_status`, `registration_date`, `ad_other`, `admin_onof`, `admin_default`, `admin_subcplan`) VALUES
(1, 1, 1, 'admin', 'ZEdWemRBPT0=', 'HURE Care', NULL, '****', 'tanveer@gmail.com', 1, '2025-02-20 19:48:11', 0, 0, 0, 0),
(2, 1, 2, 'Jackson', 'ZEdWemRBPT0=', 'Dr. Jacksons', NULL, '', '***', 1, '2025-08-23 10:15:10', 3, 1, 0, 0),
(3, 1, 2, 'dolly', 'ZEdWemREWT0=', 'Dr. Dolly Smith', NULL, '', '***', 1, '2025-08-23 11:47:31', 2, 0, 0, 0),
(4, 1, 3, 'ABCD', 'ZEdWemRBPT0=', 'ABCD', NULL, '**', '**', 1, '2025-09-01 16:39:39', 0, 0, 0, 0),
(5, 1, 9, 'johnmwangi', 'ZEdWemRBPT0=', 'John Mwangi', NULL, '***', '***', 1, '2025-09-03 18:34:28', 0, 0, 0, 0),
(6, 1, 8, 'jonday', 'ZEdWemREWT0=', 'Jon Day', NULL, '***', '***', 1, '2025-09-18 15:39:00', 0, 0, 0, 0),
(7, 1, 2, 'Anand1', 'ZEdWemRBPT0=', 'Dr Anand', NULL, '', 'brigitashirima@yahoo.com', 1, '2025-09-20 18:26:50', 4, 1, 0, 0),
(8, 1, 9, 'Kmwanza', 'ZEdWemRBPT0=', 'Kamau Mwanza', NULL, '071234567', 'hureplatform@gmail.com', 1, '2025-09-28 19:28:04', 0, 1, 0, 0),
(9, 1, 1, 'Jonny Day', 'YlhWemJXRnVjbWxoZWpnNE9EZz0=', 'M Usman', NULL, '03038507420', 'musmanriaz8888@gmail.com', 1, '2025-10-01 14:34:51', 0, 0, 0, 0),
(11, 2, 2, 'khalid', 'ZEdWemRBPT0=', 'Khalid', NULL, '0565456464', 'Khalid@yahoo.com', 1, '2025-10-27 16:19:10', 6, 0, 0, 1),
(12, 2, 2, 'khalid2', 'ZEdWemRBPT0=', 'Khalid', NULL, '0565456464', 'Khalid@yahoo.com', 1, '2025-10-27 16:20:43', 6, 0, 0, 1),
(19, 2, 9, 'tanveer', 'ZEdWemRBPT0=', 'Tanveer Ahmad Ansari', NULL, '1234567890', 'demo123@example.com', 1, '2025-10-31 12:30:01', 0, 0, 1, 1),
(20, 1, 9, 'farrukh', 'ZEdWemRBPT0=', 'farrukh azad', NULL, '03158', 'fusamaf@yahoo.com', 1, '2025-10-31 14:25:29', 0, 0, 1, 0),
(21, 8, 9, 'usama', 'ZEdWemRBPT0=', 'farrukh azad', NULL, '03158', 'fusama@yahoo.com', 1, '2025-10-31 21:42:29', 0, 0, 1, 7),
(24, 11, 9, 'sadmin', 'TVRJek5EVTI=', 'sajid', NULL, '00000', 'sajid@yahoo.com', 1, '2025-10-31 23:46:22', 0, 0, 1, 10),
(25, 12, 9, 'sadmin2', 'TVRJek5EVTI=', 'abc', NULL, '13131', 'sajid@yahoo.com', 2, '2025-11-01 01:17:10', 0, 0, 1, 11),
(29, 16, 9, 'hamza', 'TVRJek5EVTI=', 'Hamza', NULL, '', 'Hamza@yahoo.com', 1, '2025-11-04 22:39:19', 0, 0, 1, 15),
(30, 17, 9, 'jameel', 'TVRJek5EVTI=', 'jameel', NULL, '', 'fusamaf@yahoo.com', 1, '2025-11-07 18:55:59', 0, 1, 1, 16),
(31, 8, 2, 'doctor1', 'ZEdWemRBPT0=', 'Doctor1', NULL, '', 'aa', 1, '2025-11-11 21:56:16', 9, 0, 0, 7),
(32, 8, 2, 'doctor2', 'ZEdWemRBPT0=', 'Doctor2', NULL, '44', 'aa', 1, '2025-11-11 21:58:11', 10, 0, 0, 7),
(33, 17, 4, 'aaa', 'ZEdWemRBPT0=', 'aaa', NULL, '5644665', 'fusamaf@yahoo.com', 1, '2025-11-11 22:02:24', 0, 0, 0, 16);

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `app_id` int NOT NULL,
  `app_branch` int NOT NULL,
  `app_year` int NOT NULL,
  `app_date` date NOT NULL,
  `app_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_category` int NOT NULL,
  `app_patient_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `app_patient_id` int NOT NULL,
  `app_appno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_serial` int NOT NULL,
  `app_doctor` int NOT NULL,
  `app_reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `app_user` int NOT NULL,
  `app_by` int NOT NULL,
  `entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `app_up_date` datetime DEFAULT NULL,
  `app_up_by` int NOT NULL,
  `app_status` int NOT NULL COMMENT '0=Scheduled,1=Checked In,2=In Session,3=Completed,4=Cancel',
  `app_visite_remark` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `app_bp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_bp_diastolic` int NOT NULL,
  `app_pulse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_temprature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_spo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_pain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_weight` decimal(25,3) DEFAULT NULL,
  `app_height` decimal(25,2) DEFAULT NULL,
  `app_bmi` decimal(25,2) NOT NULL,
  `app_rr` int NOT NULL,
  `app_age` int NOT NULL,
  `app_triagenotes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `app_triage_date` date DEFAULT NULL,
  `app_triage_by` int NOT NULL,
  `app_bill_status` int NOT NULL COMMENT '0=Pending,1=Bill generate',
  `agerange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bmirange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bprange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rrange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sporange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pulserane` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `temprange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `painrange` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_disch_date` date DEFAULT NULL,
  `app_disch_time` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `app_disch_note` longtext COLLATE utf8mb4_general_ci,
  `app_disch_by` int DEFAULT NULL,
  `app_slot_duration` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`app_id`, `app_branch`, `app_year`, `app_date`, `app_time`, `app_category`, `app_patient_name`, `app_patient_id`, `app_appno`, `app_serial`, `app_doctor`, `app_reason`, `app_user`, `app_by`, `entrydate`, `app_up_date`, `app_up_by`, `app_status`, `app_visite_remark`, `app_bp`, `app_bp_diastolic`, `app_pulse`, `app_temprature`, `app_spo`, `app_pain`, `app_weight`, `app_height`, `app_bmi`, `app_rr`, `app_age`, `app_triagenotes`, `app_triage_date`, `app_triage_by`, `app_bill_status`, `agerange`, `bmirange`, `bprange`, `rrange`, `sporange`, `pulserane`, `temprange`, `painrange`, `app_disch_date`, `app_disch_time`, `app_disch_note`, `app_disch_by`, `app_slot_duration`) VALUES
(1, 1, 1, '2025-08-29', '10:15 AM', 0, 'Abid Ansari', 1, '01/24', 1, 2, 'Fever Check Up', 0, 1, '2025-08-29 16:30:10', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 1, '2025-08-29', '12:00 AM', 0, '', 3, '02/24', 2, 3, 'Fever, Vomitimg', 0, 1, '2025-08-29 16:31:21', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 1, '2025-08-29', '10:10 AM', 0, '', 2, '03/24', 3, 3, 'Fever Temp: 110 dc', 0, 1, '2025-08-29 16:32:07', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 1, '2025-08-29', '11:06 AM', 0, '', 3, '04/24', 4, 2, 'Demo', 0, 1, '2025-08-29 16:40:26', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 1, 1, '2025-08-30', '04:00 PM', 0, 'Mr jaicobi', 4, '05/24', 5, 3, 'Headache', 0, 1, '2025-08-30 15:22:36', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 1, 1, '2025-08-30', '04:00 PM', 0, 'Abid Ansari', 1, '06/24', 6, 3, 'Tooth Pain', 0, 1, '2025-08-30 15:32:08', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 1, 1, '2025-09-01', '12:00 PM', 0, '', 2, '07/24', 7, 2, 'Demo Test', 0, 3, '2025-09-01 09:33:43', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 1, 1, '2025-09-26', '10:05 AM', 0, 'Mr jaicobi', 4, '08/24', 8, 3, 'Fever Checkup', 0, 1, '2025-09-02 09:15:40', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 1, 1, '2025-09-02', '11:00 AM', 0, 'Anas Khan', 2, '09/24', 9, 3, 'Follow Up', 0, 1, '2025-09-02 09:16:05', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 1, 1, '2025-09-02', '12:00 PM', 0, 'Anas Khan', 2, '010/24', 10, 2, 'Hii', 0, 3, '2025-09-02 13:14:07', NULL, 0, 1, NULL, '', 0, '', '', '', '', 0.000, 0.00, 0.00, 0, 0, '', '2025-09-15', 3, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 1, 1, '2025-09-04', '11:00 AM', 0, 'Mr jaicobi', 4, '011/24', 11, 2, 'Fever', 0, 3, '2025-09-04 16:08:10', NULL, 0, 2, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 1, 1, '2025-11-06', '03:20 PM', 0, 'Abid Ansari', 1, '012/24', 12, 4, 'Fever Checkup', 0, 3, '2025-09-06 15:40:25', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 1, 1, '2025-09-06', '05:40 PM', 0, 'Alisha', 3, '013/24', 13, 2, 'Vomitting', 0, 3, '2025-09-06 15:40:52', NULL, 0, 2, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 1, 1, '2025-09-06', '07:00 PM', 0, 'Anas Khan', 2, '014/24', 14, 2, 'Follow Up', 0, 3, '2025-09-06 15:41:26', NULL, 0, 2, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 1, 1, '2025-09-06', '12:00 PM', 0, 'Mr jaicobi', 4, '015/24', 15, 2, 'New Visit', 0, 3, '2025-09-06 15:42:10', NULL, 0, 2, NULL, '', 0, '', '', '', '', 0.000, 0.00, 0.00, 0, 34, '', '2025-09-22', 3, 1, 'Adult', '', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL),
(16, 1, 1, '2025-09-06', '05:00 PM', 0, 'Joe Lee', 5, '016/24', 16, 3, 'Follow Up', 0, 1, '2025-09-06 15:43:37', NULL, 0, 2, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 1, 1, '2025-09-06', '04:00 AM', 0, 'Jon kee', 6, '017/24', 17, 3, 'Fever Checkup', 0, 1, '2025-09-06 15:44:51', NULL, 0, 2, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 1, 1, '2025-09-11', '10:21 AM', 0, 'Jon kee', 6, '018/24', 18, 2, 'Tooth Pain', 0, 3, '2025-09-11 09:22:05', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 1, 1, '2025-09-20', '03:06 PM', 0, 'Jon kee', 6, '019/2025', 19, 2, 'Fever Check Up', 0, 3, '2025-09-20 15:06:56', NULL, 0, 2, NULL, '110', 75, '12', '110', '12', '15', 55.000, 118.00, 39.50, 11, 45, 'Testing Purpose', '2025-09-23', 3, 1, 'Middle Age', 'High (Obese)', 'Normal', 'Low (Bradypnea)', 'Severe Hypoxemia', 'Low (Bradycardia)', '', '', NULL, NULL, NULL, NULL, NULL),
(20, 1, 1, '2025-09-20', '03:52 PM', 0, 'Joe Lee', 5, '020/2025', 20, 2, 'Tooth pain', 0, 3, '2025-09-20 15:53:04', NULL, 0, 2, NULL, '110', 75, '12', '12', '12', '14', 56.000, 118.00, 40.22, 12, 28, 'Testing Purpose', '2025-09-23', 3, 1, 'Adult', 'High (Obese)', 'Normal', 'Normal', 'Severe Hypoxemia', 'Low (Bradycardia)', 'Hypothermia (Critical)', '', NULL, NULL, NULL, NULL, NULL),
(21, 1, 1, '2025-09-24', '12:05 AM', 0, 'Tanveer Ahmad', 9, '021/2025', 21, 2, 'Follow Up', 0, 3, '2025-09-24 09:47:50', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 1, 1, '2025-09-06', '12:10 AM', 0, 'Fela Kuti', 11, '022/2025', 22, 4, 'Headache', 0, 3, '2025-09-25 08:15:35', NULL, 0, 2, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 1, 1, '2025-09-24', '12:05 AM', 0, 'Fela Kuti', 11, '023/2025', 23, 2, 'headache', 0, 3, '2025-09-25 08:16:54', NULL, 0, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 1, 1, '2025-09-30', '12:05 AM', 0, 'Abid Ansari', 1, '024/2025', 24, 2, 'xxxx', 0, 6, '2025-09-28 12:27:17', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 1, 1, '2025-10-01', '12:10 AM', 0, 'Alisha', 3, '025/2025', 25, 5, 'xxx', 0, 8, '2025-09-28 12:42:25', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 1, 1, '2025-09-30', '12:15 AM', 0, 'Anas Khan', 2, '026/2025', 26, 2, 'xxx', 0, 6, '2025-09-29 05:52:14', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 1, 1, '2025-09-29', '12:20 AM', 0, 'Anil Kumar', 7, '027/2025', 27, 2, 'xxx', 0, 6, '2025-09-29 05:52:54', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 1, 1, '2025-09-29', '12:10 AM', 0, 'Mine Lasi', 8, '028/2025', 28, 3, 'xxx', 0, 6, '2025-09-29 05:57:36', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 2, 1, '2025-11-03', '09:30 AM', 0, 'Anil Yadav', 12, '01/2025', 1, 6, 'Folow Up', 0, 11, '2025-11-02 20:34:18', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 1, 1, '2025-11-09', '04:35 AM', 0, 'Abid Ansari', 1, '029/2025', 29, 4, 'coughing consultation', 0, 3, '2025-11-09 07:31:44', NULL, 0, 1, NULL, '115', 85, '90', '35', '95', '5', 80.000, 180.00, 24.69, 20, 45, '', '2025-11-09', 3, 0, 'Middle Age', 'Normal', 'Stage 1 Hypertension', 'Normal', 'Normal', 'Normal', 'Low Normal', 'Moderate Pain', NULL, NULL, NULL, NULL, NULL),
(31, 11, 1, '2025-11-03', '11:50 AM', 0, 'Abrar', 13, '01/2025', 1, 11, 'Fever', 0, 24, '2025-11-11 19:58:53', NULL, 0, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 1, 1, '2025-11-22', '04:45 PM', 0, 'Mine Lasi', 8, '030/2025', 30, 3, 'cough', 0, 5, '2025-11-21 21:36:04', NULL, 0, 1, NULL, '115', 65, '90', '35', '95', '5', 60.000, 180.00, 18.52, 12, 24, '', '2025-11-22', 5, 0, 'Young Adult', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Low Normal', 'Moderate Pain', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `auth_clinicnotes`
--

CREATE TABLE `auth_clinicnotes` (
  `auth_cn_id` int NOT NULL,
  `auth_cn_practype` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_genral` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_dental` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_obgyn` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_padiatric` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_internal_med` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_surgery` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_ent` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_dermatology` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_radiology` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_opthalmology` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_orthopedic` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_psychiatry` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `auth_cn_physitherapy` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_clinicnotes`
--

INSERT INTO `auth_clinicnotes` (`auth_cn_id`, `auth_cn_practype`, `auth_cn_genral`, `auth_cn_dental`, `auth_cn_obgyn`, `auth_cn_padiatric`, `auth_cn_internal_med`, `auth_cn_surgery`, `auth_cn_ent`, `auth_cn_dermatology`, `auth_cn_radiology`, `auth_cn_opthalmology`, `auth_cn_orthopedic`, `auth_cn_psychiatry`, `auth_cn_physitherapy`) VALUES
(1, 'Custom', 'General', 'Dental', 'Obgyn', 'Padiatrics', 'Internal Med', 'Surgery', 'Ent', 'Dermatology', 'Radiology', 'Ophthalmology', 'Orthopedics', 'Psychiatry', 'Physiotherapy');

-- --------------------------------------------------------

--
-- Table structure for table `benefit_category`
--

CREATE TABLE `benefit_category` (
  `bfc_id` int NOT NULL,
  `bfc_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `benefit_category`
--

INSERT INTO `benefit_category` (`bfc_id`, `bfc_name`) VALUES
(1, 'Outpatient'),
(2, 'Inpatient'),
(3, 'Maternity'),
(4, 'Dental'),
(5, 'Optical');

-- --------------------------------------------------------

--
-- Table structure for table `bill_details`
--

CREATE TABLE `bill_details` (
  `bd_id` int NOT NULL,
  `bd_invid` int NOT NULL,
  `bd_type` int NOT NULL COMMENT '1=ICD,2=Lab,3=Pharmacy,4= Other',
  `bd_modultype_id` int NOT NULL,
  `bd_module_id` int NOT NULL,
  `bd_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bd_qty` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bd_price` decimal(25,2) NOT NULL,
  `bd_amount` decimal(25,2) NOT NULL,
  `bd_status` int NOT NULL,
  `bd_type2` int NOT NULL COMMENT '1=Investigate,2=ICD,3=Other'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bill_details`
--

INSERT INTO `bill_details` (`bd_id`, `bd_invid`, `bd_type`, `bd_modultype_id`, `bd_module_id`, `bd_description`, `bd_qty`, `bd_price`, `bd_amount`, `bd_status`, `bd_type2`) VALUES
(1, 1, 1, 19, 19, 'Registration Fee', '0', 10.00, 10.00, 0, 0),
(2, 2, 2, 19, 19, 'Consultation Fee', '0', 10.00, 10.00, 0, 0),
(3, 3, 3, 9, 1, 'CBC', NULL, 10.00, 10.00, 0, 1),
(4, 3, 3, 10, 4, 'X-Ray', NULL, 100.00, 100.00, 0, 1),
(5, 3, 3, 0, 1, 'C-09', NULL, 100.00, 100.00, 0, 2),
(6, 4, 4, 19, 19, 'Testing Purpose', NULL, 10.00, 10.00, 0, 0),
(7, 5, 5, 5, 1, 'Amoxicillin', '1', 12.00, 12.00, 0, 0),
(8, 5, 5, 6, 3, 'Gauze', '1', 12.00, 12.00, 0, 0),
(9, 6, 1, 20, 20, 'Registration Fee', '0', 10.00, 10.00, 0, 0),
(10, 7, 2, 20, 20, 'Consultation Fee', '0', 1000.00, 1000.00, 0, 0),
(11, 8, 3, 11, 1, 'CBC', NULL, 10.00, 10.00, 0, 1),
(12, 8, 3, 12, 4, 'X-Ray', NULL, 100.00, 100.00, 0, 1),
(13, 8, 3, 0, 1, 'C-09', NULL, 100.00, 100.00, 0, 2),
(14, 9, 4, 20, 20, 'Testing Purpose', NULL, 10.00, 10.00, 0, 0),
(15, 10, 5, 7, 1, 'Amoxicillin', '1', 154.00, 154.00, 0, 0),
(16, 10, 5, 8, 3, 'Gauze', '1', 12.00, 12.00, 0, 0),
(17, 11, 1, 15, 15, 'Registration Fee', '0', 10.00, 10.00, 0, 0),
(18, 12, 2, 15, 15, 'Consutation Fee', '0', 10.00, 10.00, 0, 0),
(19, 13, 2, 17, 17, 'Consultation Fee', '0', 0.00, 0.00, 0, 0),
(20, 14, 3, 13, 1, 'CBC', NULL, 10.00, 10.00, 0, 1),
(21, 14, 3, 14, 4, 'X-Ray', NULL, 100.00, 100.00, 0, 1),
(22, 16, 2, 16, 16, 'Consutation Fee', '0', 0.00, 0.00, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `ct_id` int NOT NULL,
  `ct_branch` int NOT NULL,
  `ct_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`ct_id`, `ct_branch`, `ct_name`) VALUES
(1, 1, 'Pharmacological'),
(2, 1, 'Non-Pharmacological');

-- --------------------------------------------------------

--
-- Table structure for table `category_form`
--

CREATE TABLE `category_form` (
  `ctf_id` int NOT NULL,
  `ctf_branch` int NOT NULL,
  `ctf_ctid` int NOT NULL,
  `ctf_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category_form`
--

INSERT INTO `category_form` (`ctf_id`, `ctf_branch`, `ctf_ctid`, `ctf_name`) VALUES
(1, 0, 1, 'Tablet'),
(2, 0, 1, 'Capsul'),
(3, 0, 1, 'Syrup'),
(4, 0, 2, 'Supplies'),
(5, 0, 2, 'Devices'),
(6, 0, 2, 'Consumable'),
(7, 1, 1, 'Tablet'),
(8, 2, 1, 'Tablet'),
(9, 2, 2, 'Pack');

-- --------------------------------------------------------

--
-- Table structure for table `clinic_notes`
--

CREATE TABLE `clinic_notes` (
  `cn_id` int NOT NULL,
  `cn_branch` int NOT NULL,
  `cn_year` int NOT NULL,
  `cn_date` date NOT NULL,
  `cn_patient` int NOT NULL,
  `cn_app_id` int NOT NULL,
  `cn_icd_code` int NOT NULL,
  `cn_icd_price` decimal(25,2) NOT NULL,
  `cn_soap_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cn_tooth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_tooth_id` int NOT NULL,
  `cn_tooth_note` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cn_slip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_serial` int NOT NULL,
  `cn_by` int NOT NULL,
  `cn_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cn_specialist` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_soap_single` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_subjective` longtext COLLATE utf8mb4_general_ci,
  `cn_objective` longtext COLLATE utf8mb4_general_ci,
  `cn_assessment` longtext COLLATE utf8mb4_general_ci,
  `cn_plan` longtext COLLATE utf8mb4_general_ci,
  `cn_icd_secondary` int NOT NULL,
  `cn_gap` longtext COLLATE utf8mb4_general_ci,
  `cn_gobservation` longtext COLLATE utf8mb4_general_ci,
  `cn_gnote` longtext COLLATE utf8mb4_general_ci,
  `cn_lmp` date DEFAULT NULL,
  `cn_edd` date DEFAULT NULL,
  `cn_ga` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_gravida` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_para` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_fhr` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_exam_notes` longtext COLLATE utf8mb4_general_ci,
  `cn_plan_follow` longtext COLLATE utf8mb4_general_ci,
  `cn_weight` decimal(25,3) DEFAULT NULL,
  `cn_height` decimal(25,2) DEFAULT NULL,
  `cn_percentile_wt` decimal(25,2) DEFAULT NULL,
  `cn_percentile_ht` decimal(25,2) DEFAULT NULL,
  `cn_immunization` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cn_notesgrowthcoment` longtext COLLATE utf8mb4_general_ci,
  `med_problem` longtext COLLATE utf8mb4_general_ci,
  `med_bp` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_latest` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_medication` longtext COLLATE utf8mb4_general_ci,
  `med_planadjust` longtext COLLATE utf8mb4_general_ci,
  `srg_npo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `srg_consent` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `srg_hx` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `srg_imaging` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `srg_asa` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `srg_anesthia` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `srg_oprative` longtext COLLATE utf8mb4_general_ci,
  `srg_pop` longtext COLLATE utf8mb4_general_ci,
  `ent_ear` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_nasal` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_throat` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_right_db` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_left_db` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_plan_ent` longtext COLLATE utf8mb4_general_ci,
  `der_lesion` longtext COLLATE utf8mb4_general_ci,
  `der_mophology` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `der_bodysurface` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `der_treatment` longtext COLLATE utf8mb4_general_ci,
  `rdo_imgmodality` int DEFAULT NULL,
  `rdo_imgmodal_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rdo_measurment` longtext COLLATE utf8mb4_general_ci,
  `rdo_impresion` longtext COLLATE utf8mb4_general_ci,
  `oph_visual_r` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oph_visual_l` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oph_iop_r` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oph_iop_l` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oph_refraction` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oph_slitlamp` longtext COLLATE utf8mb4_general_ci,
  `ortho_injury_side` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ortho_rom` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ortho_specialtest` longtext COLLATE utf8mb4_general_ci,
  `ortho_immobilization` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ortho_plan_rehab` longtext COLLATE utf8mb4_general_ci,
  `psy_phq` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `psy_gad` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `psy_mental_state` longtext COLLATE utf8mb4_general_ci,
  `psy_risk` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `psy_plan_follow` longtext COLLATE utf8mb4_general_ci,
  `phy_score` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phy_goals` longtext COLLATE utf8mb4_general_ci,
  `phy_session` longtext COLLATE utf8mb4_general_ci,
  `phy_progress` longtext COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clinic_notes`
--

INSERT INTO `clinic_notes` (`cn_id`, `cn_branch`, `cn_year`, `cn_date`, `cn_patient`, `cn_app_id`, `cn_icd_code`, `cn_icd_price`, `cn_soap_notes`, `cn_tooth`, `cn_tooth_id`, `cn_tooth_note`, `cn_slip`, `cn_serial`, `cn_by`, `cn_entrydate`, `cn_specialist`, `cn_soap_single`, `cn_subjective`, `cn_objective`, `cn_assessment`, `cn_plan`, `cn_icd_secondary`, `cn_gap`, `cn_gobservation`, `cn_gnote`, `cn_lmp`, `cn_edd`, `cn_ga`, `cn_gravida`, `cn_para`, `cn_fhr`, `cn_exam_notes`, `cn_plan_follow`, `cn_weight`, `cn_height`, `cn_percentile_wt`, `cn_percentile_ht`, `cn_immunization`, `cn_notesgrowthcoment`, `med_problem`, `med_bp`, `med_latest`, `med_medication`, `med_planadjust`, `srg_npo`, `srg_consent`, `srg_hx`, `srg_imaging`, `srg_asa`, `srg_anesthia`, `srg_oprative`, `srg_pop`, `ent_ear`, `ent_nasal`, `ent_throat`, `ent_right_db`, `ent_left_db`, `ent_plan_ent`, `der_lesion`, `der_mophology`, `der_bodysurface`, `der_treatment`, `rdo_imgmodality`, `rdo_imgmodal_name`, `rdo_measurment`, `rdo_impresion`, `oph_visual_r`, `oph_visual_l`, `oph_iop_r`, `oph_iop_l`, `oph_refraction`, `oph_slitlamp`, `ortho_injury_side`, `ortho_rom`, `ortho_specialtest`, `ortho_immobilization`, `ortho_plan_rehab`, `psy_phq`, `psy_gad`, `psy_mental_state`, `psy_risk`, `psy_plan_follow`, `phy_score`, `phy_goals`, `phy_session`, `phy_progress`) VALUES
(1, 1, 1, '2025-11-05', 4, 11, 2, 800.00, 'LEFT TOOTH PAIN', 'Tooth 19', 19, 'OKAY', '01', 1, 3, '2025-09-08 08:41:54', 'Dental', 'Single Note', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '1970-01-01', '1970-01-01', '', '', '', '', NULL, NULL, 0.000, 0.00, 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 1, '2025-09-14', 1, 12, 2, 800.00, 'egggrt', NULL, 0, NULL, '02', 2, 3, '2025-09-14 20:59:24', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 1, '2025-09-14', 2, 14, 2, 800.00, 'malaria', NULL, 0, NULL, '03', 3, 3, '2025-09-14 21:53:52', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 1, '2025-11-05', 3, 13, 2, 800.00, 'uhiop', NULL, 0, NULL, '04', 4, 3, '2025-09-14 21:57:14', '', '', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '1970-01-01', '1970-01-01', '', '', '', '', NULL, NULL, 0.000, 0.00, 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 1, 1, '2025-09-19', 4, 15, 2, 800.00, 'Tooth Pain', NULL, 0, NULL, '05', 5, 3, '2025-09-19 15:06:55', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 1, 1, '2025-11-20', 6, 19, 2, 800.00, 'Tooth Pain', NULL, 0, NULL, '06', 6, 3, '2025-09-20 15:08:14', 'Dental', '', NULL, NULL, NULL, NULL, 0, '', '', '', NULL, NULL, '', '', '', '', '', '', 0.000, 0.00, 0.00, 0.00, '', '', '', '', '', '', '', NULL, NULL, NULL, NULL, 'I', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Macule', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', NULL, NULL, 'Splint', NULL, NULL, NULL, NULL, 'Low', NULL, NULL, NULL, NULL, NULL),
(9, 1, 1, '2025-09-20', 5, 20, 2, 800.00, 'Tooth Pain', NULL, 0, NULL, '07', 7, 3, '2025-09-20 15:54:16', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 1, 1, '2025-09-21', 5, 16, 3, 12.00, 'yreb ', NULL, 0, NULL, '08', 8, 2, '2025-09-21 21:01:46', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 1, 1, '2025-09-21', 6, 17, 2, 800.00, '  resfuigjun4ajuabnu9gespoji', NULL, 0, NULL, '09', 9, 2, '2025-09-21 21:02:32', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 1, 1, '2025-11-10', 11, 22, 2, 0.00, NULL, NULL, 0, NULL, '010', 10, 3, '2025-11-09 11:13:26', 'Orthopedics', 'SOAP', '', '', '', '', 3, NULL, NULL, NULL, '1970-01-01', '1970-01-01', '', '', '', '', NULL, NULL, 0.000, 0.00, 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `clinic_notes_detail`
--

CREATE TABLE `clinic_notes_detail` (
  `cnd_id` int NOT NULL,
  `cnd_cnid` int NOT NULL,
  `cnd_dental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cnd_dental_id` int NOT NULL,
  `cnd_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cnd_surface` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clinic_notes_detail`
--

INSERT INTO `clinic_notes_detail` (`cnd_id`, `cnd_cnid`, `cnd_dental`, `cnd_dental_id`, `cnd_notes`, `cnd_surface`) VALUES
(1, 1, 'Tooth 21', 0, 'OKAY', ''),
(4, 2, '', 0, '', NULL),
(5, 3, '', 0, '', NULL),
(6, 4, '', 0, '', NULL),
(12, 7, 'Tooth 25', 25, 'Tooth Pain', NULL),
(13, 7, 'Tooth 26', 26, 'Tooth Pain', NULL),
(14, 8, 'Tooth 9', 0, 'Tooth Pain', ''),
(15, 8, 'Tooth 26', 0, 'Tooth Pain', ''),
(16, 9, 'Tooth 10', 10, 'Tooth Pain', NULL),
(17, 9, 'Tooth 25', 25, 'Tooth Pain', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `company_branch`
--

CREATE TABLE `company_branch` (
  `company_id` int NOT NULL,
  `company_branch` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `comp_sbcp_id` int NOT NULL,
  `comp_type` int NOT NULL COMMENT '0=Active=1=Delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_branch`
--

INSERT INTO `company_branch` (`company_id`, `company_branch`, `comp_sbcp_id`, `comp_type`) VALUES
(1, 'HURE Care', 0, 0),
(2, 'KGN Care Center', 1, 0),
(3, 'uni', 2, 0),
(4, 'Uni', 3, 0),
(5, 'Uni', 4, 0),
(6, 'Uni', 5, 0),
(7, 'Uni', 6, 1),
(8, 'Uni', 7, 0),
(9, 'aaa', 8, 1),
(11, 'Pakistan Ltd', 10, 0),
(12, 'ABC', 11, 1),
(16, 'Universal', 15, 0),
(17, 'ABCD', 16, 0);

-- --------------------------------------------------------

--
-- Table structure for table `compnay_profile`
--

CREATE TABLE `compnay_profile` (
  `c_id` int NOT NULL,
  `c_role` int NOT NULL,
  `c_branch` int NOT NULL,
  `c_name` varchar(255) NOT NULL,
  `c_address` longtext NOT NULL,
  `c_city` varchar(255) NOT NULL,
  `c_pincode` varchar(255) NOT NULL,
  `c_state` varchar(255) NOT NULL,
  `c_code` varchar(255) NOT NULL,
  `c_email` varchar(255) NOT NULL,
  `c_ifcs` varchar(255) NOT NULL,
  `c_gstin` varchar(255) NOT NULL,
  `c_panno` varchar(255) NOT NULL,
  `c_owner` varchar(255) NOT NULL,
  `c_mobile` varchar(50) NOT NULL,
  `c_website` varchar(255) NOT NULL,
  `profile` varchar(255) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `new_arrival` int NOT NULL,
  `c_license` varchar(255) DEFAULT NULL,
  `c_country` varchar(255) DEFAULT NULL,
  `c_subcplan` int NOT NULL,
  `c_default` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `compnay_profile`
--

INSERT INTO `compnay_profile` (`c_id`, `c_role`, `c_branch`, `c_name`, `c_address`, `c_city`, `c_pincode`, `c_state`, `c_code`, `c_email`, `c_ifcs`, `c_gstin`, `c_panno`, `c_owner`, `c_mobile`, `c_website`, `profile`, `logo`, `new_arrival`, `c_license`, `c_country`, `c_subcplan`, `c_default`) VALUES
(1, 1, 1, 'HURE Care', '****', 'Bhadohi', '221401', 'U.P.', '09', '***', '***', '***', '***', 'HURE Care', '***', '***', '3030.png', '5090.png', 10, '***', 'Kenya', 0, 0),
(2, 9, 2, 'KGN Care Center', '', '', '', '', '', 'demo123@example.com', '', '', '', 'Tanveer Ahmad Ansari', '1234567890', '', '', '', 0, NULL, 'India', 1, 1),
(3, 9, 3, 'uni', '', '', '', '', '', 'fusamaf@yahoo.com', '', '', '', 'farrukh azad', '03158110829', '', '', '', 0, NULL, 'Pakistan', 2, 1),
(4, 9, 4, 'Uni', '', '', '', '', '', 'fusamaf@yahoo.com', '', '', '', 'farrukh azad', '03158110829', '', '', '', 0, NULL, 'Pakistan', 3, 1),
(5, 9, 5, 'Uni', '', '', '', '', '', 'fusamaf@yahoo.com', '', '', '', 'farrukh azad', '03158110829', '', '', '', 0, NULL, 'Pakistan', 4, 1),
(6, 9, 6, 'Uni', '', '', '', '', '', 'fusamaf@yahoo.com', '', '', '', 'farrukh azad', '03158110829', '', '', '', 0, NULL, 'Pakistan', 5, 1),
(7, 9, 7, 'Uni', '', '', '', '', '', 'fusamaf', '', '', '', 'farrukh azad', '03158110829', '', '', '', 0, NULL, 'Pakistan', 6, 1),
(8, 9, 8, 'Uni', '', '', '', '', '', 'fusama@yahoo.com', '', '', '', 'farrukh azad', '03158', '', '', '', 0, NULL, 'Pakistan', 7, 1),
(9, 9, 9, 'aaa', '', '', '', '', '', 'aaa', '', '', '', 'aaa', 'aaa', '', '', '', 0, NULL, 'aaa', 8, 1),
(11, 9, 11, 'Pakistan Ltd', '', '', '', '', '', 'sajid@yahoo.com', '', '', '', 'sajid', '00000', '', '', '', 0, NULL, 'pakistan', 10, 1),
(12, 9, 12, 'ABC', '', '', '', '', '', 'sajid@yahoo.com', '', '', '', 'abc', '13131', '', '', '', 0, NULL, '30', 11, 1),
(16, 9, 16, 'Universal', '', '', '', '', '', 'Hamza@yahoo.com', '', '', '', 'Hamza', '', '', '', '', 0, NULL, '', 15, 1),
(17, 9, 17, 'ABCD', '', '', '', '', '', 'fusamaf@yahoo.com', '', '', '', 'jameel', '', '', '', '', 0, NULL, '', 16, 1);

-- --------------------------------------------------------

--
-- Table structure for table `dentals`
--

CREATE TABLE `dentals` (
  `dental_id` int NOT NULL,
  `dental_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dentals`
--

INSERT INTO `dentals` (`dental_id`, `dental_name`) VALUES
(1, '1'),
(2, '2'),
(3, '3'),
(4, '4'),
(5, '5'),
(6, '6'),
(7, '7');

-- --------------------------------------------------------

--
-- Table structure for table `doase`
--

CREATE TABLE `doase` (
  `doase_id` int NOT NULL,
  `doase_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doase`
--

INSERT INTO `doase` (`doase_id`, `doase_name`) VALUES
(1, 'Daily'),
(2, 'Weekly'),
(3, 'Monthly');

-- --------------------------------------------------------

--
-- Table structure for table `gender`
--

CREATE TABLE `gender` (
  `gendr_id` int NOT NULL,
  `gendr_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gender`
--

INSERT INTO `gender` (`gendr_id`, `gendr_name`) VALUES
(1, 'Male'),
(2, 'Female'),
(3, 'Other');

-- --------------------------------------------------------

--
-- Table structure for table `icd_code`
--

CREATE TABLE `icd_code` (
  `icd_id` int NOT NULL,
  `icd_branch` int NOT NULL,
  `icd_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icd_amount` decimal(25,2) NOT NULL,
  `icd_description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `icd_entrydate` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `icd_code`
--

INSERT INTO `icd_code` (`icd_id`, `icd_branch`, `icd_code`, `icd_amount`, `icd_description`, `icd_entrydate`) VALUES
(1, 1, 'C-09', 100.00, 'DEMO', '2025-09-12 15:28:54'),
(2, 1, 'C-08', 800.00, 'DEMO', '2025-09-12 15:28:54'),
(3, 1, 'C54', 12.00, 'Testing', '2025-09-20 15:52:01'),
(4, 1, 'C67', 0.00, 'Testing', '2025-09-21 09:43:50');

-- --------------------------------------------------------

--
-- Table structure for table `investigation`
--

CREATE TABLE `investigation` (
  `invest_id` int NOT NULL,
  `invest_branch` int NOT NULL,
  `invest_year` int NOT NULL,
  `invest_app_id` int NOT NULL,
  `invest_cn_id` int NOT NULL,
  `invest_date` date NOT NULL,
  `invest_slipno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `invest_serial` int NOT NULL,
  `invest_patient` int NOT NULL,
  `invest_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `invest_result` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `invest_by` int NOT NULL,
  `entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `investigation`
--

INSERT INTO `investigation` (`invest_id`, `invest_branch`, `invest_year`, `invest_app_id`, `invest_cn_id`, `invest_date`, `invest_slipno`, `invest_serial`, `invest_patient`, `invest_notes`, `invest_result`, `invest_by`, `entrydate`) VALUES
(1, 1, 1, 13, 4, '2025-09-14', '01', 1, 3, NULL, NULL, 3, '2025-09-14 21:57:35'),
(2, 1, 1, 14, 3, '2025-09-14', '02', 2, 2, NULL, NULL, 3, '2025-09-14 21:57:40'),
(3, 1, 1, 12, 2, '2025-09-18', '03', 3, 1, NULL, NULL, 3, '2025-09-18 15:10:26'),
(4, 1, 1, 19, 8, '2025-09-20', '04', 4, 6, NULL, NULL, 3, '2025-09-20 15:08:27'),
(5, 1, 1, 20, 9, '2025-09-20', '05', 5, 5, NULL, NULL, 3, '2025-09-20 15:54:34'),
(6, 1, 1, 17, 11, '2025-09-21', '06', 6, 6, NULL, NULL, 2, '2025-09-21 21:05:41'),
(7, 1, 1, 16, 10, '2025-09-25', '07', 7, 5, NULL, NULL, 2, '2025-09-25 07:00:06'),
(8, 1, 1, 11, 1, '2025-09-29', '08', 8, 4, NULL, NULL, 3, '2025-09-29 05:31:37'),
(9, 1, 1, 22, 0, '2025-11-09', '09', 9, 11, NULL, NULL, 3, '2025-11-09 06:40:12');

-- --------------------------------------------------------

--
-- Table structure for table `investigation_details`
--

CREATE TABLE `investigation_details` (
  `investd_id` int NOT NULL,
  `investd_invid` int NOT NULL,
  `investd_test` int NOT NULL,
  `investd_type` int NOT NULL,
  `investd_price` decimal(25,2) NOT NULL,
  `investd_results` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `investd_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `investd_status` int NOT NULL COMMENT '0=Pending,1=Complete',
  `investd_bill_status` int NOT NULL COMMENT '0=Pening,1=Bill Generate'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `investigation_details`
--

INSERT INTO `investigation_details` (`investd_id`, `investd_invid`, `investd_test`, `investd_type`, `investd_price`, `investd_results`, `investd_notes`, `investd_status`, `investd_bill_status`) VALUES
(1, 1, 1, 1, 10.00, '8961_7519_Screenshot 2025-08-25 231928.png', NULL, 1, 0),
(2, 1, 4, 2, 100.00, '5676_Screenshot 2025-05-04 213637.png', NULL, 1, 0),
(3, 2, 2, 1, 10.00, '7937_7519_Screenshot 2025-08-25 231928.png', NULL, 1, 0),
(4, 2, 1, 1, 10.00, NULL, NULL, 0, 0),
(5, 2, 4, 2, 100.00, NULL, NULL, 0, 0),
(7, 3, 1, 1, 10.00, NULL, NULL, 0, 0),
(8, 3, 3, 1, 10.00, NULL, NULL, 0, 0),
(9, 4, 1, 1, 10.00, '8523_tooth_down.jpg', 'Testing', 1, 0),
(10, 4, 4, 2, 100.00, '2722_tooth_down.jpg', 'Testing', 1, 0),
(11, 5, 1, 1, 10.00, '7264_tooth_up.png', 'Tooth Pain', 1, 0),
(12, 5, 4, 2, 100.00, '9987_7519_Screenshot 2025-08-25 231928.png', NULL, 1, 0),
(13, 6, 1, 1, 10.00, '7721_Screenshot 2024-08-11 022707.png', NULL, 1, 0),
(14, 6, 4, 2, 100.00, '2701_Screenshot 2024-08-11 023527.png', NULL, 1, 0),
(15, 7, 2, 1, 10.00, '7219_Hure_Logo_Slogan.png', NULL, 1, 0),
(16, 8, 3, 1, 10.00, '3005_7519_Screenshot 2025-08-25 231928.png', NULL, 1, 0),
(17, 8, 1, 1, 10.00, NULL, NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `inv_id` int NOT NULL,
  `inv_branch` int NOT NULL,
  `inv_year` int NOT NULL,
  `inv_stage` int NOT NULL COMMENT '1=Registration,2=Consultent,3=Investigate,4=FollowUp,5=Pharmacy',
  `inv_type` int NOT NULL COMMENT '1=Out Patient,2=In Patient',
  `inv_date` date NOT NULL,
  `inv_app_id` int NOT NULL,
  `inv_patient` int NOT NULL,
  `inv_invoice_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `inv_bed_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inv_discharge_date` date DEFAULT NULL,
  `inv_serial` int NOT NULL,
  `inv_discount` decimal(25,2) NOT NULL,
  `inv_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `inv_by` int NOT NULL,
  `inv_status` int NOT NULL COMMENT '0=Bill,1=Payment',
  `inv_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pay_serial` int NOT NULL,
  `pay_invid` int NOT NULL,
  `pay_mode` int NOT NULL,
  `pay_amount` decimal(25,2) NOT NULL,
  `inv_tax_percent` int NOT NULL,
  `inv_pay_status` int NOT NULL COMMENT '0=Pending Bill,1=Bill Complete',
  `inv_payerid` int NOT NULL,
  `inv_payername` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inv_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`inv_id`, `inv_branch`, `inv_year`, `inv_stage`, `inv_type`, `inv_date`, `inv_app_id`, `inv_patient`, `inv_invoice_no`, `inv_bed_no`, `inv_discharge_date`, `inv_serial`, `inv_discount`, `inv_notes`, `inv_by`, `inv_status`, `inv_entrydate`, `pay_serial`, `pay_invid`, `pay_mode`, `pay_amount`, `inv_tax_percent`, `inv_pay_status`, `inv_payerid`, `inv_payername`, `inv_reference`) VALUES
(1, 1, 1, 1, 0, '2025-09-20', 19, 6, '2025-01', NULL, NULL, 1, 0.00, NULL, 3, 0, '2025-09-20 15:10:57', 0, 0, 1, 10.00, 0, 1, 0, NULL, NULL),
(2, 1, 1, 2, 1, '2025-09-20', 19, 6, '2025-02', NULL, NULL, 2, 0.00, NULL, 3, 0, '2025-09-20 15:11:20', 0, 0, 1, 10.00, 0, 1, 0, NULL, NULL),
(3, 1, 1, 3, 1, '2025-09-20', 19, 6, '2025-03', NULL, NULL, 3, 0.00, NULL, 3, 0, '2025-09-20 15:11:58', 0, 0, 1, 210.00, 0, 1, 0, NULL, NULL),
(4, 1, 1, 4, 1, '2025-09-20', 19, 6, '2025-04', NULL, NULL, 4, 0.00, NULL, 3, 0, '2025-09-20 15:12:35', 0, 0, 1, 10.00, 0, 1, 0, NULL, NULL),
(5, 1, 1, 5, 1, '2025-09-20', 19, 6, '2025-05', '', NULL, 5, 1.00, NULL, 3, 0, '2025-09-20 15:13:09', 0, 0, 1, 24.20, 5, 1, 0, NULL, NULL),
(6, 1, 1, 1, 0, '2025-09-20', 20, 5, '2025-06', NULL, NULL, 6, 0.00, NULL, 3, 0, '2025-09-20 15:56:20', 0, 0, 1, 10.00, 0, 1, 0, NULL, NULL),
(7, 1, 1, 2, 1, '2025-09-20', 20, 5, '2025-07', NULL, NULL, 7, 0.00, NULL, 3, 0, '2025-09-20 15:56:39', 0, 0, 1, 1000.00, 0, 1, 0, NULL, NULL),
(8, 1, 1, 3, 1, '2025-09-20', 20, 5, '2025-08', NULL, NULL, 8, 0.00, NULL, 3, 0, '2025-09-20 15:57:01', 0, 0, 1, 210.00, 0, 1, 0, NULL, NULL),
(9, 1, 1, 4, 1, '2025-09-20', 20, 5, '2025-09', NULL, NULL, 9, 0.00, NULL, 3, 0, '2025-09-20 15:57:36', 0, 0, 1, 10.00, 0, 1, 0, NULL, NULL),
(10, 1, 1, 5, 1, '2025-09-20', 20, 5, '2025-010', '', NULL, 10, 10.00, NULL, 3, 0, '2025-09-20 15:58:09', 0, 0, 1, 164.30, 5, 1, 0, NULL, NULL),
(11, 1, 1, 1, 0, '2025-09-20', 15, 4, '2025-011', NULL, NULL, 11, 0.00, NULL, 3, 0, '2025-09-20 20:15:00', 0, 0, 1, 10.00, 0, 1, 0, NULL, NULL),
(12, 1, 1, 2, 1, '2025-09-25', 15, 4, '2025-012', NULL, NULL, 12, 0.00, NULL, 3, 0, '2025-09-20 20:16:38', 0, 0, 0, 10.00, 0, 1, 0, NULL, NULL),
(13, 1, 1, 2, 1, '2025-09-06', 17, 6, '2025-013', NULL, NULL, 13, 0.00, NULL, 2, 0, '2025-09-25 07:03:00', 0, 0, 0, 0.00, 0, 0, 0, NULL, NULL),
(14, 1, 1, 3, 1, '2025-09-25', 17, 6, '2025-014', NULL, NULL, 14, 0.00, NULL, 2, 0, '2025-09-25 07:03:33', 0, 0, 0, 0.00, 0, 0, 0, NULL, NULL),
(15, 1, 1, 3, 0, '2025-09-25', 17, 6, '2025-01', NULL, NULL, 0, 0.00, '', 2, 1, '2025-09-25 07:03:49', 1, 14, 1, 10.00, 0, 0, 2, 'Insurance', ''),
(16, 1, 1, 2, 1, '2025-09-06', 16, 5, '2025-015', NULL, NULL, 15, 0.00, NULL, 2, 0, '2025-09-25 07:07:22', 0, 0, 0, 0.00, 0, 0, 0, NULL, NULL),
(17, 1, 1, 2, 0, '2025-09-25', 15, 4, '2025-02', NULL, NULL, 0, 0.00, 'Paid', 3, 1, '2025-09-25 12:17:07', 2, 12, 1, 10.00, 0, 0, 1, 'Patient', '112'),
(18, 1, 1, 5, 0, '2025-09-26', 20, 5, '2025-03', NULL, NULL, 0, 0.00, '', 3, 1, '2025-09-26 03:11:55', 3, 10, 1, 200.00, 0, 0, 1, 'Patient', ''),
(19, 1, 1, 2, 0, '2025-09-28', 20, 5, '2025-04', NULL, NULL, 0, 0.00, '', 3, 1, '2025-09-28 08:19:10', 4, 7, 2, 1000.00, 0, 0, 1, 'Patient', ''),
(20, 1, 1, 3, 0, '2025-11-29', 20, 5, '2025-05', NULL, NULL, 0, 0.00, 'Paid', 3, 1, '2025-11-29 02:10:23', 5, 8, 1, 320.00, 0, 0, 1, 'Patient', '234324');

-- --------------------------------------------------------

--
-- Table structure for table `medical_notes`
--

CREATE TABLE `medical_notes` (
  `md_id` int NOT NULL,
  `md_branch` int NOT NULL,
  `md_year` int NOT NULL,
  `md_date` date NOT NULL,
  `md_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `md_app_id` int NOT NULL,
  `md_patient` int NOT NULL,
  `md_by` int NOT NULL,
  `md_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_notes`
--

INSERT INTO `medical_notes` (`md_id`, `md_branch`, `md_year`, `md_date`, `md_notes`, `md_app_id`, `md_patient`, `md_by`, `md_entrydate`) VALUES
(1, 1, 1, '2025-09-20', 'Vomiting', 19, 6, 3, '2025-09-20 15:09:31'),
(2, 1, 1, '2025-09-20', 'Vomiting', 20, 5, 3, '2025-09-20 15:55:26');

-- --------------------------------------------------------

--
-- Table structure for table `our_plan`
--

CREATE TABLE `our_plan` (
  `plan_id` int NOT NULL,
  `plan_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `plan_price_month` decimal(25,2) NOT NULL,
  `plan_price_year` decimal(25,2) NOT NULL,
  `plan_offer` decimal(25,2) DEFAULT NULL,
  `plan_status` int NOT NULL,
  `plan_staff` int NOT NULL,
  `plan_location` int NOT NULL,
  `plan_feature_type` int NOT NULL COMMENT '1=Staff,2=Location',
  `plan_note` longtext COLLATE utf8mb4_general_ci,
  `plan_type` int NOT NULL COMMENT '0=Plan,1=Add-ons'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `our_plan`
--

INSERT INTO `our_plan` (`plan_id`, `plan_name`, `plan_price_month`, `plan_price_year`, `plan_offer`, `plan_status`, `plan_staff`, `plan_location`, `plan_feature_type`, `plan_note`, `plan_type`) VALUES
(1, 'Essential', 10000.00, 120000.00, NULL, 0, 10, 1, 0, NULL, 0),
(2, 'Professional', 18000.00, 216000.00, NULL, 0, 30, 2, 0, NULL, 0),
(3, 'Enterprise', 30000.00, 360000.00, NULL, 0, 75, 5, 0, NULL, 0),
(4, 'Premium', 15000.00, 180000.00, NULL, 0, 15, 3, 0, NULL, 0),
(5, 'Extra 10 Staff', 1500.00, 0.00, NULL, 0, 10, 0, 1, 'For team exceeding tier capacity', 1),
(6, 'Extra 2 Location', 1000.00, 0.00, NULL, 0, 0, 2, 2, 'Add new branch under same account', 1),
(7, 'Extra 15 Staff', 1700.00, 0.00, NULL, 0, 15, 0, 1, 'For exceeding staff capacity', 1);

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE `patient` (
  `pat_id` int NOT NULL,
  `pat_branch` int NOT NULL,
  `pat_year` int NOT NULL,
  `pat_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `pat_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_serial` int NOT NULL,
  `pat_dob` date DEFAULT NULL,
  `pat_age` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_gender` int NOT NULL,
  `pat_insurance` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pat_by` int NOT NULL,
  `pat_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pat_paymode` int NOT NULL,
  `pat_insurer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_plan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_member` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_dependent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pat_status` int NOT NULL COMMENT '0=Active,1=De-Active',
  `pat_email_membername` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`pat_id`, `pat_branch`, `pat_year`, `pat_name`, `pat_mobile`, `pat_email`, `pat_address`, `pat_no`, `pat_serial`, `pat_dob`, `pat_age`, `pat_gender`, `pat_insurance`, `entrydate`, `pat_by`, `pat_entrydate`, `pat_paymode`, `pat_insurer`, `pat_plan`, `pat_member`, `pat_dependent`, `pat_status`, `pat_email_membername`) VALUES
(1, 1, 1, 'Abid Ansari', '098776545', '****', '****', '01', 1, '1970-01-01', '12', 1, '***', '2025-08-22 17:50:31', 1, '2025-09-12 15:28:54', 1, '', '', '', '', 0, ''),
(2, 1, 1, 'Anas Khan', '***', '', '', '02', 2, NULL, '15', 1, '', '2025-08-22 19:48:50', 1, '2025-09-12 15:28:54', 0, NULL, NULL, NULL, NULL, 0, NULL),
(3, 1, 1, 'Alisha', '09547657657', '**', '', '03', 3, NULL, '11', 2, '**', '2025-08-23 09:51:04', 1, '2025-09-12 15:28:54', 0, NULL, NULL, NULL, NULL, 0, NULL),
(4, 1, 1, 'Mr jaicobi', '9999999999', '', '', '04', 4, NULL, '34', 1, '', '2025-08-30 15:21:14', 1, '2025-09-12 15:28:54', 0, NULL, NULL, NULL, NULL, 0, NULL),
(5, 1, 1, 'Joe Lee', '***', '***', '', '05', 5, NULL, '28', 1, '', '2025-09-06 15:43:10', 1, '2025-09-12 15:28:54', 0, NULL, NULL, NULL, NULL, 0, NULL),
(6, 1, 1, 'Jon kee', '***', '', '', '06', 6, '1980-01-18', '45', 1, '', '2025-09-06 15:44:17', 1, '2025-09-12 15:28:54', 1, NULL, '', '', '', 0, NULL),
(7, 1, 1, 'Anil Kumar', '***', '***', '', '07', 7, '1980-02-05', '45', 1, '', '2025-09-20 15:04:51', 3, '2025-09-20 15:04:51', 1, '', '', '', '', 0, NULL),
(8, 1, 1, 'Mine Lasi', '254123456', 'felakut@yahoo.com', '', '08', 8, '2013-12-19', '24', 2, 'Fine', '2025-09-23 20:59:00', 7, '2025-09-23 20:59:00', 1, '', '', '', '', 1, NULL),
(9, 1, 1, 'Tanveer Ahmad', '***', 'tanveeransaribcom@gmail.com', '', '09', 9, '2000-01-18', '25', 1, '', '2025-09-24 09:29:05', 3, '2025-09-24 09:29:05', 1, '', '', '', '', 0, NULL),
(10, 1, 1, 'Anwar', '**', 'tanveeransaribcom@gmail.com', '', '010', 10, '2000-01-18', '25', 1, '', '2025-09-24 09:55:09', 3, '2025-09-24 09:55:09', 1, '', '', '', '', 0, NULL),
(11, 1, 1, 'Fela Kuti', '0721345678', 'felakuti@gm,com', '', '011', 11, '2000-01-08', '25', 2, 'Jared 0733123456', '2025-09-25 08:15:05', 3, '2025-09-25 08:15:05', 2, 'Britam', 'Inpatient', '123456', '0', 0, NULL),
(12, 2, 1, 'Anil Yadav', '***', '***', '', '01', 1, '1990-06-08', '35', 1, '***', '2025-11-02 20:33:52', 11, '2025-11-02 20:33:52', 1, '', '', '', '', 0, ''),
(13, 11, 1, 'Abrar', '**', '***', '', '01', 1, '2000-02-02', '25', 1, '**', '2025-11-11 19:58:20', 24, '2025-11-11 19:58:20', 1, '', '', '', '', 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `pay_id` int NOT NULL,
  `pay_year` int NOT NULL,
  `pay_branch` int NOT NULL,
  `pay_app_id` int NOT NULL,
  `pay_patient` int NOT NULL,
  `pay_date` date NOT NULL,
  `pay_type` int NOT NULL,
  `pay_amount` decimal(25,2) NOT NULL,
  `pay_recptno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pay_serial` int NOT NULL,
  `pay_by` int NOT NULL,
  `pay_entrdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymode`
--

CREATE TABLE `paymode` (
  `paym_id` int NOT NULL,
  `paym_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `paymode`
--

INSERT INTO `paymode` (`paym_id`, `paym_name`) VALUES
(1, 'Cash'),
(2, 'M-Pesa'),
(3, 'Card'),
(4, 'EFT/Bank'),
(5, 'Cheque');

-- --------------------------------------------------------

--
-- Table structure for table `prescription`
--

CREATE TABLE `prescription` (
  `prs_id` int NOT NULL,
  `prs_year` int NOT NULL,
  `prs_branch` int NOT NULL,
  `prs_app_id` int NOT NULL,
  `prs_patient` int NOT NULL,
  `prs_cn_id` int NOT NULL,
  `prs_date` date NOT NULL,
  `prs_serial` int NOT NULL,
  `prs_slip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prs_medicine` int NOT NULL,
  `prs_medicine_category` int NOT NULL,
  `prs_doase` int NOT NULL,
  `prs_unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prs_qty` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prs_remark` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `prs_by` int NOT NULL,
  `prs_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `prs_up_by` int DEFAULT NULL,
  `prs_up_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescription`
--

INSERT INTO `prescription` (`prs_id`, `prs_year`, `prs_branch`, `prs_app_id`, `prs_patient`, `prs_cn_id`, `prs_date`, `prs_serial`, `prs_slip`, `prs_medicine`, `prs_medicine_category`, `prs_doase`, `prs_unit`, `prs_qty`, `prs_remark`, `prs_by`, `prs_entrydate`, `prs_up_by`, `prs_up_date`) VALUES
(1, 1, 1, 12, 1, 2, '2025-09-18', 1, '01', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-18 15:14:53', NULL, NULL),
(2, 1, 1, 15, 4, 7, '2025-09-20', 2, '02', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-20 09:30:09', NULL, NULL),
(3, 1, 1, 19, 6, 8, '2025-09-20', 3, '03', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-20 15:09:07', NULL, NULL),
(4, 1, 1, 20, 5, 9, '2025-09-20', 4, '04', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-20 15:55:10', NULL, NULL),
(5, 1, 1, 12, 1, 2, '2025-09-24', 5, '05', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-24 12:07:42', NULL, NULL),
(6, 1, 1, 12, 1, 2, '2025-09-24', 6, '06', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-24 12:08:11', NULL, NULL),
(7, 1, 1, 16, 5, 10, '2025-09-25', 7, '07', 0, 0, 0, NULL, NULL, NULL, 2, '2025-09-25 07:02:24', NULL, NULL),
(8, 1, 1, 19, 6, 8, '2025-09-25', 8, '08', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-25 10:28:06', NULL, NULL),
(9, 1, 1, 14, 2, 3, '2025-09-29', 9, '09', 0, 0, 0, NULL, NULL, NULL, 3, '2025-09-29 05:59:44', NULL, NULL),
(12, 1, 1, 19, 6, 8, '2025-11-15', 10, '010', 0, 0, 0, NULL, NULL, NULL, 6, '2025-11-15 01:15:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `prescription_details`
--

CREATE TABLE `prescription_details` (
  `prsd_id` int NOT NULL,
  `prsd_prsid` int NOT NULL,
  `prsd_type` int NOT NULL,
  `prsd_medicine` int NOT NULL,
  `prsd_form` int NOT NULL,
  `prsd_doase` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prsd_duration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prsd_quantity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prsd_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `prsd_bill_qty` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prsd_price` decimal(25,2) NOT NULL,
  `prsd_amount` decimal(25,2) NOT NULL,
  `prsd_bill_status` int NOT NULL COMMENT '0=Pending,1=Bill Generate'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescription_details`
--

INSERT INTO `prescription_details` (`prsd_id`, `prsd_prsid`, `prsd_type`, `prsd_medicine`, `prsd_form`, `prsd_doase`, `prsd_duration`, `prsd_quantity`, `prsd_notes`, `prsd_bill_qty`, `prsd_price`, `prsd_amount`, `prsd_bill_status`) VALUES
(1, 6, 1, 5, 1, '1', '2 Time', NULL, 'After Food', NULL, 0.00, 0.00, 0),
(2, 6, 1, 2, 0, '1', '2 Time', NULL, 'After Food', NULL, 0.00, 0.00, 0),
(3, 2, 1, 5, 2, '1', '2 Time', NULL, 'After Food', NULL, 0.00, 0.00, 0),
(4, 2, 2, 3, 4, NULL, NULL, '1', 'Demo', NULL, 0.00, 0.00, 0),
(5, 12, 1, 1, 7, '1', '2 Time ', NULL, 'After Food', NULL, 0.00, 0.00, 0),
(6, 12, 2, 3, 0, NULL, NULL, '1', 'Testing Purpose', NULL, 0.00, 0.00, 0),
(7, 4, 1, 1, 0, '1', '2 Time', NULL, 'After Food', NULL, 0.00, 0.00, 0),
(8, 4, 2, 3, 0, NULL, NULL, '1', 'Testing Purpose', NULL, 0.00, 0.00, 0),
(11, 7, 1, 1, 0, '1x2', '3 days', NULL, 'replace with alternative if not in stock', NULL, 0.00, 0.00, 0),
(13, 9, 1, 6, 2, '2', '3', NULL, 'xx', NULL, 0.00, 0.00, 0),
(14, 1, 1, 2, 7, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `p_id` int NOT NULL,
  `p_branch` int NOT NULL,
  `p_category` int NOT NULL,
  `p_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `p_hsn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `p_strength` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `p_category_form` int NOT NULL,
  `p_instruction` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `p_price` decimal(25,2) NOT NULL,
  `p_uom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `p_sku` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `p_taxable` int NOT NULL COMMENT '1=Taxable,0=Non-Taxable',
  `p_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `p_netqty` decimal(25,2) NOT NULL,
  `p_stock` decimal(25,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`p_id`, `p_branch`, `p_category`, `p_name`, `p_hsn`, `p_strength`, `p_category_form`, `p_instruction`, `p_price`, `p_uom`, `p_sku`, `p_taxable`, `p_entrydate`, `p_netqty`, `p_stock`) VALUES
(1, 1, 1, 'Amoxicillin', '', '', 0, '', 60.00, NULL, NULL, 0, '2025-09-12 15:28:54', 0.00, 0.00),
(2, 1, 1, 'Ibuprofen', '', '', 0, '', 45.00, NULL, NULL, 0, '2025-09-12 15:28:54', 0.00, 0.00),
(3, 1, 2, 'Gauze', '', NULL, 0, NULL, 0.00, NULL, NULL, 0, '2025-09-12 15:28:54', 0.00, 0.00),
(4, 1, 2, 'Gloves (pair)', '', NULL, 0, NULL, 0.00, NULL, NULL, 0, '2025-09-12 15:28:54', 0.00, 0.00),
(5, 1, 1, 'Flagyl', NULL, '200mg', 1, '40000', 5.00, NULL, NULL, 0, '2025-09-14 22:31:36', 0.00, 0.00),
(6, 1, 1, 'Flagyl', NULL, '200mg', 1, 'BD', 0.00, NULL, NULL, 0, '2025-09-21 21:16:44', 0.00, 0.00),
(7, 2, 1, 'Brustan', NULL, '400', 8, '', 0.00, NULL, NULL, 0, '2025-11-14 21:12:35', 0.00, 0.00),
(8, 2, 2, 'ORS', NULL, NULL, 9, NULL, 0.00, '', '', 0, '2025-11-14 21:12:51', 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `relation`
--

CREATE TABLE `relation` (
  `r_id` int NOT NULL,
  `r_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `relation`
--

INSERT INTO `relation` (`r_id`, `r_name`) VALUES
(1, 'Self'),
(2, 'Mother'),
(3, 'Father'),
(4, 'Son'),
(5, 'Daughter'),
(6, 'Brother'),
(7, 'Spouse'),
(8, 'Uncle'),
(9, 'Other');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `r_id` int NOT NULL,
  `r_level` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`r_id`, `r_level`) VALUES
(1, 'Admin'),
(2, 'Doctor'),
(3, 'Clinical Team'),
(4, 'Nurse'),
(5, 'Front Desk Staff'),
(6, 'Lab & Imaging Technician'),
(7, 'Pharmacist'),
(8, 'Super-Admin'),
(9, 'Employer / Clinic Owner');

-- --------------------------------------------------------

--
-- Table structure for table `sessionyear`
--

CREATE TABLE `sessionyear` (
  `sy_id` int NOT NULL,
  `sy_name` varchar(255) NOT NULL,
  `ses_suf` varchar(255) NOT NULL,
  `frm_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `ses_short` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sessionyear`
--

INSERT INTO `sessionyear` (`sy_id`, `sy_name`, `ses_suf`, `frm_date`, `to_date`, `ses_short`) VALUES
(1, '2025-26', '25-26', '2025-04-01', '2026-03-31', 2025);

-- --------------------------------------------------------

--
-- Table structure for table `subcription_plan`
--

CREATE TABLE `subcription_plan` (
  `sbcp_id` int NOT NULL,
  `sbcp_plan_id` int NOT NULL,
  `sbcp_plan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sbcp_price` decimal(25,2) NOT NULL,
  `sbcp_period` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `sbcp_date_from` date NOT NULL,
  `sbcp_date_expiry` date NOT NULL,
  `sbcp_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sbcp_organization` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sbcp_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sbcp_phone` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sbcp_country` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sbcp_entrydate` datetime NOT NULL,
  `sbcp_status` int NOT NULL COMMENT '0=Active,1=Expire,2=InActive',
  `sbcp_pay_status` int NOT NULL COMMENT '1=Paid,2=Pending,3=Draft',
  `sbcp_renew_count` int DEFAULT '0',
  `sbcp_staff` int NOT NULL,
  `sbcp_location` int NOT NULL,
  `sbcp_addon_staf` int NOT NULL,
  `sbcp_addon_location` int NOT NULL,
  `sbcp_tot_staf` int NOT NULL,
  `sbcp_tot_location` int NOT NULL,
  `sbcp_delete` int NOT NULL COMMENT '0=Running,1=Delete',
  `sbcp_delete_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subcription_plan`
--

INSERT INTO `subcription_plan` (`sbcp_id`, `sbcp_plan_id`, `sbcp_plan`, `sbcp_price`, `sbcp_period`, `sbcp_date_from`, `sbcp_date_expiry`, `sbcp_name`, `sbcp_organization`, `sbcp_email`, `sbcp_phone`, `sbcp_country`, `sbcp_entrydate`, `sbcp_status`, `sbcp_pay_status`, `sbcp_renew_count`, `sbcp_staff`, `sbcp_location`, `sbcp_addon_staf`, `sbcp_addon_location`, `sbcp_tot_staf`, `sbcp_tot_location`, `sbcp_delete`, `sbcp_delete_date`) VALUES
(1, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'Tanveer Ahmad Ansari', 'KGN Care Center', '1234567890', 'demo123@example.com', 'India', '2025-10-27 12:06:18', 0, 0, 0, 0, 0, 0, 0, 10, 1, 0, NULL),
(2, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'farrukh azad', 'uni', 'fusamaf@yahoo.com', '03158110829', 'Pakistan', '2025-10-30 11:11:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-10-30 19:37:18'),
(3, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'farrukh azad', 'Uni', 'fusamaf@yahoo.com', '03158110829', 'Pakistan', '2025-10-30 20:02:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-10-30 20:08:08'),
(4, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'farrukh azad', 'Uni', 'fusamaf@yahoo.com', '03158110829', 'Pakistan', '2025-10-30 20:06:00', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-10-30 20:08:03'),
(5, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'farrukh azad', 'Uni', 'fusamaf@yahoo.com', '03158110829', 'Pakistan', '2025-10-30 20:12:58', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-10-30 20:25:11'),
(6, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'farrukh azad', 'Uni', 'fusamaf', '03158110829', 'Pakistan', '2025-10-31 14:25:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-10-31 21:35:08'),
(7, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'farrukh azad', 'Uni', '03158', 'fusama@yahoo.com', 'Pakistan', '2025-10-31 21:42:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL),
(8, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'aaa', 'aaa', 'aaa', 'aaa', 'aaa', '2025-10-31 22:14:22', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-10-31 22:35:38'),
(10, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'sajid', 'Pakistan Ltd', '00000', 'sajid@yahoo.com', 'pakistan', '2025-10-31 23:46:22', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL),
(11, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'abc', 'ABC', 'sajid@yahoo.com', '13131', '30', '2025-11-01 01:17:10', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '2025-11-01 01:17:39'),
(15, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'Hamza', 'Universal', 'Hamza@yahoo.com', '', '', '2025-11-04 22:39:19', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL),
(16, 0, NULL, 0.00, '', '0000-00-00', '0000-00-00', 'jameel', 'ABCD', 'fusamaf@yahoo.com', '', '', '2025-11-07 18:55:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plan_history`
--

CREATE TABLE `subscription_plan_history` (
  `history_id` int NOT NULL,
  `h_sbcp_id` int NOT NULL,
  `h_sbcp_plan_id` int NOT NULL,
  `h_sbcp_plan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `h_sbcp_price` decimal(25,2) NOT NULL,
  `h_sbcp_period` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `h_sbcp_date_from` date NOT NULL,
  `h_sbcp_date_expiry` date NOT NULL,
  `h_sbcp_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `h_sbcp_organization` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `h_sbcp_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `h_sbcp_phone` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `h_sbcp_country` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `h_sbcp_entrydate` datetime NOT NULL,
  `h_sbcp_status` int NOT NULL COMMENT '0=Active,1=Expire,2=InActive,3=Upgrade',
  `h_sbcp_pay_status` int NOT NULL COMMENT '1=Paid,2=Pending,3=Draft',
  `h_sbcp_renew_count` int DEFAULT '0',
  `h_moved_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `h_sbcp_staff` int NOT NULL,
  `h_sbcp_location` int NOT NULL,
  `h_sbcp_addon_staf` int NOT NULL,
  `h_sbcp_addon_location` int NOT NULL,
  `h_sbcp_tot_staf` int NOT NULL,
  `h_sbcp_tot_location` int NOT NULL,
  `h_type` int NOT NULL COMMENT '0=NOne,1=Default',
  `h_sbcpexp_status` int NOT NULL COMMENT '0=Running Plan,1=Expire Plan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plan_history`
--

INSERT INTO `subscription_plan_history` (`history_id`, `h_sbcp_id`, `h_sbcp_plan_id`, `h_sbcp_plan`, `h_sbcp_price`, `h_sbcp_period`, `h_sbcp_date_from`, `h_sbcp_date_expiry`, `h_sbcp_name`, `h_sbcp_organization`, `h_sbcp_email`, `h_sbcp_phone`, `h_sbcp_country`, `h_sbcp_entrydate`, `h_sbcp_status`, `h_sbcp_pay_status`, `h_sbcp_renew_count`, `h_moved_on`, `h_sbcp_staff`, `h_sbcp_location`, `h_sbcp_addon_staf`, `h_sbcp_addon_location`, `h_sbcp_tot_staf`, `h_sbcp_tot_location`, `h_type`, `h_sbcpexp_status`) VALUES
(1, 1, 1, 'Essential', 600.00, 'Yearly', '2025-10-30', '2025-11-18', NULL, NULL, NULL, NULL, NULL, '2025-10-30 12:24:21', 0, 1, 0, '2025-10-27 02:06:18', 10, 1, 0, 0, 10, 1, 1, 0),
(3, 1, 2, 'Professional', 18000.00, 'Monthly', '2025-09-02', '2025-10-02', NULL, NULL, NULL, NULL, NULL, '2025-10-27 12:52:24', 2, 1, 0, '2025-10-27 02:45:40', 30, 2, 0, 0, 30, 2, 0, 0),
(4, 2, 4, 'Premium', 15000.00, 'Monthly', '2025-10-30', '2025-11-30', NULL, NULL, NULL, NULL, NULL, '2025-10-30 11:11:04', 0, 1, 0, '2025-10-30 01:11:04', 15, 3, 0, 0, 15, 3, 1, 0),
(5, 3, 4, 'Premium', 15000.00, 'Monthly', '2025-10-30', '2025-11-30', NULL, NULL, NULL, NULL, NULL, '2025-10-30 20:02:04', 0, 1, 0, '2025-10-30 10:02:04', 15, 3, 0, 0, 15, 3, 1, 0),
(6, 4, 3, 'Enterprise', 360000.00, 'Yearly', '2025-10-30', '2026-10-30', NULL, NULL, NULL, NULL, NULL, '2025-10-30 20:06:00', 0, 1, 0, '2025-10-30 10:06:00', 75, 5, 0, 0, 75, 5, 1, 0),
(7, 5, 3, 'Enterprise', 30000.00, 'Monthly', '2025-10-30', '2025-11-30', NULL, NULL, NULL, NULL, NULL, '2025-10-30 20:12:58', 0, 1, 0, '2025-10-30 10:12:58', 75, 5, 0, 0, 75, 5, 1, 0),
(8, 1, 4, 'Premium', 15000.00, 'Monthly', '2025-10-30', '2025-11-30', NULL, NULL, NULL, NULL, NULL, '2025-10-30 21:12:14', 2, 1, 0, '2025-10-30 11:12:14', 15, 3, 0, 0, 15, 3, 0, 0),
(9, 6, 3, 'Enterprise', 30000.00, 'Monthly', '2025-10-31', '2025-12-01', NULL, NULL, NULL, NULL, NULL, '2025-10-31 14:25:29', 0, 1, 0, '2025-10-31 04:25:29', 75, 5, 0, 0, 75, 5, 1, 0),
(10, 7, 1, 'Essential', 7000.00, 'Monthly', '2025-11-01', '2025-12-01', NULL, NULL, NULL, NULL, NULL, '2025-10-31 21:42:29', 0, 1, 0, '2025-10-31 11:42:29', 10, 1, 0, 0, 10, 1, 1, 0),
(11, 8, 1, 'Essential', 500.00, 'Monthly', '2025-11-01', '2025-12-01', NULL, NULL, NULL, NULL, NULL, '2025-10-31 22:14:22', 0, 1, 0, '2025-10-31 12:14:22', 10, 1, 0, 0, 10, 1, 1, 0),
(14, 10, 1, 'Essential', 1500.00, 'Monthly', '2025-11-01', '2025-12-01', NULL, NULL, NULL, NULL, NULL, '2025-10-31 23:46:22', 0, 1, 0, '2025-10-31 13:46:22', 10, 1, 0, 0, 10, 1, 1, 0),
(15, 11, 2, 'Professional', 1500.00, 'Yearly', '2025-11-14', '2026-11-14', NULL, NULL, NULL, NULL, NULL, '2025-11-01 01:17:10', 0, 1, 0, '2025-10-31 15:17:10', 30, 2, 0, 0, 30, 2, 1, 0),
(19, 15, 2, 'Professional', 18000.00, 'monthly', '2025-11-04', '2025-12-04', NULL, NULL, NULL, NULL, NULL, '2025-11-04 22:39:19', 0, 1, 0, '2025-11-04 11:39:19', 30, 2, 0, 0, 30, 2, 1, 0),
(20, 16, 1, 'Essential', 10000.00, 'monthly', '2025-11-07', '2025-12-07', NULL, NULL, NULL, NULL, NULL, '2025-11-07 18:55:59', 0, 1, 0, '2025-11-07 07:55:59', 10, 1, 0, 0, 10, 1, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `taxpercent`
--

CREATE TABLE `taxpercent` (
  `txp_id` int NOT NULL,
  `txp_percent` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taxpercent`
--

INSERT INTO `taxpercent` (`txp_id`, `txp_percent`) VALUES
(1, '5'),
(2, '12'),
(3, '18'),
(4, '28'),
(5, 'N/A');

-- --------------------------------------------------------

--
-- Table structure for table `tax_type`
--

CREATE TABLE `tax_type` (
  `txt_id` int NOT NULL,
  `txt_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tax_type`
--

INSERT INTO `tax_type` (`txt_id`, `txt_name`) VALUES
(1, 'GST(CGST+SGST)'),
(2, 'IGST'),
(3, 'N/A');

-- --------------------------------------------------------

--
-- Table structure for table `tests`
--

CREATE TABLE `tests` (
  `test_id` int NOT NULL,
  `test_branch` int NOT NULL,
  `test_type` int NOT NULL COMMENT '1=Lab,2=Imaging',
  `test_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `test_category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `test_sample` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `test_bodyregion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `test_protocol` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `test_price` decimal(25,2) NOT NULL,
  `test_entrydate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tests`
--

INSERT INTO `tests` (`test_id`, `test_branch`, `test_type`, `test_name`, `test_category`, `test_sample`, `test_bodyregion`, `test_protocol`, `test_price`, `test_entrydate`) VALUES
(1, 1, 1, 'CBC', '', '', NULL, NULL, 10.00, '2025-09-12 15:28:54'),
(2, 1, 1, 'Blood Sugar', '', '', NULL, NULL, 10.00, '2025-09-12 15:28:54'),
(3, 1, 1, 'Lipid Panel', '', '', NULL, NULL, 10.00, '2025-09-12 15:28:54'),
(4, 1, 2, 'X-Ray', NULL, NULL, 'chest', 'PA & Loteral', 100.00, '2025-09-12 15:28:54'),
(5, 1, 2, 'CT Scan', NULL, NULL, '***', '***', 120.00, '2025-09-12 15:28:54'),
(7, 2, 1, 'Blood Test', '', '', NULL, NULL, 0.00, '2025-11-14 21:13:09'),
(8, 2, 2, 'X-ray', NULL, NULL, '', '', 0.00, '2025-11-14 21:13:21'),
(9, 1, 1, 'ash', 'bvm,', 'blood', NULL, NULL, 0.00, '2025-11-21 21:30:13'),
(10, 1, 2, 'ash', NULL, NULL, 'abdomen', 'woih', 0.00, '2025-11-21 21:30:52'),
(11, 1, 1, 'ash', 'bvm,', 'blood', NULL, NULL, 0.00, '2025-11-21 21:32:19'),
(12, 1, 1, 'dytftu', 'gouip', 'yti', NULL, NULL, 0.00, '2025-11-21 21:45:30'),
(13, 1, 2, 'hjbkl', NULL, NULL, 'yuio', 'xdgv', 0.00, '2025-11-21 21:45:58'),
(14, 1, 1, 'fdx', 'gzx', 'dhz', NULL, NULL, 50.00, '2025-11-21 22:02:26'),
(15, 1, 1, 'du', 'vhjk', 'hkgh', NULL, NULL, 700.00, '2025-11-21 22:03:17'),
(16, 1, 2, 'dsfhfsgd', NULL, NULL, 'gd', 'gdhf', 100.00, '2025-11-21 22:03:40');

-- --------------------------------------------------------

--
-- Table structure for table `test_type`
--

CREATE TABLE `test_type` (
  `tt_id` int NOT NULL,
  `tt_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_type`
--

INSERT INTO `test_type` (`tt_id`, `tt_name`) VALUES
(1, 'Lab Orders'),
(2, 'Imaging Orders');

-- --------------------------------------------------------

--
-- Table structure for table `times`
--

CREATE TABLE `times` (
  `t_id` int NOT NULL,
  `t_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `times`
--

INSERT INTO `times` (`t_id`, `t_name`) VALUES
(1, '08:00'),
(2, '08:15'),
(3, '08:30'),
(4, '08:45'),
(5, '09:00'),
(6, '09:15'),
(7, '09:30'),
(8, '09:45'),
(9, '10:00'),
(10, '10:15'),
(11, '10:30'),
(12, '10:45'),
(13, '11:00'),
(14, '11:15'),
(15, '11:30'),
(16, '11:45'),
(17, '12:00'),
(18, '12:15'),
(19, '12:30'),
(20, '12:45'),
(21, '13:00'),
(22, '13:15'),
(23, '13:30'),
(24, '13:45'),
(25, '14:00'),
(26, '14:15'),
(27, '14:30'),
(28, '14:45'),
(29, '15:00'),
(30, '15:15'),
(31, '15:30'),
(32, '15:45'),
(33, '16:00'),
(34, '16:15'),
(35, '16:30'),
(36, '16:45'),
(37, '17:00'),
(38, '17:15'),
(39, '17:30'),
(40, '17:45'),
(41, '18:00'),
(42, '18:15'),
(43, '18:30'),
(44, '18:45'),
(45, '19:00'),
(46, '19:15'),
(47, '19:30'),
(48, '19:45'),
(49, '20:00'),
(50, '20:15'),
(51, '20:30'),
(52, '20:45'),
(53, '21:00'),
(54, '21:15'),
(55, '21:30'),
(56, '21:45'),
(57, '22:00'),
(58, '22:15'),
(59, '22:30'),
(60, '22:45'),
(61, '23:00'),
(62, '23:15'),
(63, '23:30'),
(64, '23:45');

-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

CREATE TABLE `unit` (
  `uid` int NOT NULL,
  `uname` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `unit`
--

INSERT INTO `unit` (`uid`, `uname`) VALUES
(1, 'Pcs');

-- --------------------------------------------------------

--
-- Table structure for table `user_rights`
--

CREATE TABLE `user_rights` (
  `ur_id` int NOT NULL,
  `ur_user` int NOT NULL,
  `ur_master` int DEFAULT NULL,
  `ur_usermanage` int DEFAULT NULL,
  `ur_user_add` int DEFAULT NULL,
  `ur_user_edit` int DEFAULT NULL,
  `ur_user_delete` int DEFAULT NULL,
  `ur_acc_view` int DEFAULT NULL,
  `ur_acc_add` int DEFAULT NULL,
  `ur_acc_edit` int DEFAULT NULL,
  `ur_acc_delete` int DEFAULT NULL,
  `ur_prs_view` int DEFAULT NULL,
  `ur_prs_add` int DEFAULT NULL,
  `ur_prs_edit` int DEFAULT NULL,
  `ur_prs_delete` int DEFAULT NULL,
  `ur_icd_view` int DEFAULT NULL,
  `ur_icd_add` int DEFAULT NULL,
  `ur_icd_edit` int DEFAULT NULL,
  `ur_icd_delete` int DEFAULT NULL,
  `ur_lab_view` int DEFAULT NULL,
  `ur_lab_add` int DEFAULT NULL,
  `ur_lab_edit` int DEFAULT NULL,
  `ur_lab_delete` int DEFAULT NULL,
  `ur_img_view` int DEFAULT NULL,
  `ur_img_add` int DEFAULT NULL,
  `ur_img_edit` int DEFAULT NULL,
  `ur_img_delete` int DEFAULT NULL,
  `ur_app_view` int DEFAULT NULL,
  `ur_app_add` int DEFAULT NULL,
  `ur_app_edit` int DEFAULT NULL,
  `ur_app_delete` int DEFAULT NULL,
  `ur_cn_view` int DEFAULT NULL,
  `ur_cn_add` int DEFAULT NULL,
  `ur_cn_edit` int DEFAULT NULL,
  `ur_cn_delete` int DEFAULT NULL,
  `ur_invest_view` int DEFAULT NULL,
  `ur_invest_add` int DEFAULT NULL,
  `ur_invest_edit` int DEFAULT NULL,
  `ur_invest_delete` int DEFAULT NULL,
  `ur_prsm_view` int DEFAULT NULL,
  `ur_prsm_add` int DEFAULT NULL,
  `ur_prsm_edit` int DEFAULT NULL,
  `ur_prsm_delete` int DEFAULT NULL,
  `ur_bill_view` int DEFAULT NULL,
  `ur_bill_add` int DEFAULT NULL,
  `ur_bill_edit` int DEFAULT NULL,
  `ur_bill_delete` int DEFAULT NULL,
  `ur_chk_view` int DEFAULT NULL,
  `ur_chk_add` int DEFAULT NULL,
  `ur_chk_edit` int DEFAULT NULL,
  `ur_chk_delete` int DEFAULT NULL,
  `ur_triage_add` int DEFAULT NULL,
  `ur_triage_edit` int DEFAULT NULL,
  `ur_triage_view` int DEFAULT NULL,
  `ur_report` int DEFAULT NULL,
  `ur_report_out` int DEFAULT NULL,
  `ur_repout_daily` int DEFAULT NULL,
  `ur_repout_diagnosis` int DEFAULT NULL,
  `ur_repout_consul` int DEFAULT NULL,
  `ur_repout_service` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_rights`
--

INSERT INTO `user_rights` (`ur_id`, `ur_user`, `ur_master`, `ur_usermanage`, `ur_user_add`, `ur_user_edit`, `ur_user_delete`, `ur_acc_view`, `ur_acc_add`, `ur_acc_edit`, `ur_acc_delete`, `ur_prs_view`, `ur_prs_add`, `ur_prs_edit`, `ur_prs_delete`, `ur_icd_view`, `ur_icd_add`, `ur_icd_edit`, `ur_icd_delete`, `ur_lab_view`, `ur_lab_add`, `ur_lab_edit`, `ur_lab_delete`, `ur_img_view`, `ur_img_add`, `ur_img_edit`, `ur_img_delete`, `ur_app_view`, `ur_app_add`, `ur_app_edit`, `ur_app_delete`, `ur_cn_view`, `ur_cn_add`, `ur_cn_edit`, `ur_cn_delete`, `ur_invest_view`, `ur_invest_add`, `ur_invest_edit`, `ur_invest_delete`, `ur_prsm_view`, `ur_prsm_add`, `ur_prsm_edit`, `ur_prsm_delete`, `ur_bill_view`, `ur_bill_add`, `ur_bill_edit`, `ur_bill_delete`, `ur_chk_view`, `ur_chk_add`, `ur_chk_edit`, `ur_chk_delete`, `ur_triage_add`, `ur_triage_edit`, `ur_triage_view`, `ur_report`, `ur_report_out`, `ur_repout_daily`, `ur_repout_diagnosis`, `ur_repout_consul`, `ur_repout_service`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, 1, 1, 1, 1, 1),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, 1, 1, NULL, NULL, 1, 1, 1, 1, 1, 1),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, 1, 1, NULL, NULL, 1, 1, 1, 1, 1, 1),
(6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, 1, 1, NULL, NULL, 1, 1, 1, 1, 1, 1),
(7, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, 1, 1, 1, NULL, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(12, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(13, 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 14, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(15, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(16, 17, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(17, 18, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(18, 20, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(19, 21, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(20, 22, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(21, 23, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(22, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(23, 25, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 26, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(25, 27, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 28, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 29, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 19, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, 1, 1, 1, 1, 1),
(29, 30, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 31, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(31, 32, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, 1, 1),
(32, 33, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `voucher_type`
--

CREATE TABLE `voucher_type` (
  `vhr_id` int NOT NULL,
  `vhr_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voucher_type`
--

INSERT INTO `voucher_type` (`vhr_id`, `vhr_name`) VALUES
(1, 'General'),
(2, 'TDS'),
(3, 'GST');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `acc_agent_group`
--
ALTER TABLE `acc_agent_group`
  ADD PRIMARY KEY (`acc_agent_id`);

--
-- Indexes for table `acc_group`
--
ALTER TABLE `acc_group`
  ADD PRIMARY KEY (`acc_grp_id`);

--
-- Indexes for table `addonsplan`
--
ALTER TABLE `addonsplan`
  ADD PRIMARY KEY (`adp_id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`app_id`);

--
-- Indexes for table `auth_clinicnotes`
--
ALTER TABLE `auth_clinicnotes`
  ADD PRIMARY KEY (`auth_cn_id`);

--
-- Indexes for table `benefit_category`
--
ALTER TABLE `benefit_category`
  ADD PRIMARY KEY (`bfc_id`);

--
-- Indexes for table `bill_details`
--
ALTER TABLE `bill_details`
  ADD PRIMARY KEY (`bd_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`ct_id`);

--
-- Indexes for table `category_form`
--
ALTER TABLE `category_form`
  ADD PRIMARY KEY (`ctf_id`);

--
-- Indexes for table `clinic_notes`
--
ALTER TABLE `clinic_notes`
  ADD PRIMARY KEY (`cn_id`);

--
-- Indexes for table `clinic_notes_detail`
--
ALTER TABLE `clinic_notes_detail`
  ADD PRIMARY KEY (`cnd_id`);

--
-- Indexes for table `company_branch`
--
ALTER TABLE `company_branch`
  ADD PRIMARY KEY (`company_id`);

--
-- Indexes for table `compnay_profile`
--
ALTER TABLE `compnay_profile`
  ADD PRIMARY KEY (`c_id`);

--
-- Indexes for table `dentals`
--
ALTER TABLE `dentals`
  ADD PRIMARY KEY (`dental_id`);

--
-- Indexes for table `doase`
--
ALTER TABLE `doase`
  ADD PRIMARY KEY (`doase_id`);

--
-- Indexes for table `gender`
--
ALTER TABLE `gender`
  ADD PRIMARY KEY (`gendr_id`);

--
-- Indexes for table `icd_code`
--
ALTER TABLE `icd_code`
  ADD PRIMARY KEY (`icd_id`);

--
-- Indexes for table `investigation`
--
ALTER TABLE `investigation`
  ADD PRIMARY KEY (`invest_id`);

--
-- Indexes for table `investigation_details`
--
ALTER TABLE `investigation_details`
  ADD PRIMARY KEY (`investd_id`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`inv_id`);

--
-- Indexes for table `medical_notes`
--
ALTER TABLE `medical_notes`
  ADD PRIMARY KEY (`md_id`);

--
-- Indexes for table `our_plan`
--
ALTER TABLE `our_plan`
  ADD PRIMARY KEY (`plan_id`);

--
-- Indexes for table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`pat_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`pay_id`);

--
-- Indexes for table `paymode`
--
ALTER TABLE `paymode`
  ADD PRIMARY KEY (`paym_id`);

--
-- Indexes for table `prescription`
--
ALTER TABLE `prescription`
  ADD PRIMARY KEY (`prs_id`);

--
-- Indexes for table `prescription_details`
--
ALTER TABLE `prescription_details`
  ADD PRIMARY KEY (`prsd_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`p_id`);

--
-- Indexes for table `relation`
--
ALTER TABLE `relation`
  ADD PRIMARY KEY (`r_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`r_id`);

--
-- Indexes for table `sessionyear`
--
ALTER TABLE `sessionyear`
  ADD PRIMARY KEY (`sy_id`);

--
-- Indexes for table `subcription_plan`
--
ALTER TABLE `subcription_plan`
  ADD PRIMARY KEY (`sbcp_id`);

--
-- Indexes for table `subscription_plan_history`
--
ALTER TABLE `subscription_plan_history`
  ADD PRIMARY KEY (`history_id`);

--
-- Indexes for table `taxpercent`
--
ALTER TABLE `taxpercent`
  ADD PRIMARY KEY (`txp_id`);

--
-- Indexes for table `tax_type`
--
ALTER TABLE `tax_type`
  ADD PRIMARY KEY (`txt_id`);

--
-- Indexes for table `tests`
--
ALTER TABLE `tests`
  ADD PRIMARY KEY (`test_id`);

--
-- Indexes for table `test_type`
--
ALTER TABLE `test_type`
  ADD PRIMARY KEY (`tt_id`);

--
-- Indexes for table `times`
--
ALTER TABLE `times`
  ADD PRIMARY KEY (`t_id`);

--
-- Indexes for table `unit`
--
ALTER TABLE `unit`
  ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `user_rights`
--
ALTER TABLE `user_rights`
  ADD PRIMARY KEY (`ur_id`);

--
-- Indexes for table `voucher_type`
--
ALTER TABLE `voucher_type`
  ADD PRIMARY KEY (`vhr_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `acc_agent_group`
--
ALTER TABLE `acc_agent_group`
  MODIFY `acc_agent_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `acc_group`
--
ALTER TABLE `acc_group`
  MODIFY `acc_grp_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `addonsplan`
--
ALTER TABLE `addonsplan`
  MODIFY `adp_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `app_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `auth_clinicnotes`
--
ALTER TABLE `auth_clinicnotes`
  MODIFY `auth_cn_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `benefit_category`
--
ALTER TABLE `benefit_category`
  MODIFY `bfc_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bill_details`
--
ALTER TABLE `bill_details`
  MODIFY `bd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `ct_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `category_form`
--
ALTER TABLE `category_form`
  MODIFY `ctf_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `clinic_notes`
--
ALTER TABLE `clinic_notes`
  MODIFY `cn_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `clinic_notes_detail`
--
ALTER TABLE `clinic_notes_detail`
  MODIFY `cnd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `company_branch`
--
ALTER TABLE `company_branch`
  MODIFY `company_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `compnay_profile`
--
ALTER TABLE `compnay_profile`
  MODIFY `c_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `dentals`
--
ALTER TABLE `dentals`
  MODIFY `dental_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `doase`
--
ALTER TABLE `doase`
  MODIFY `doase_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gender`
--
ALTER TABLE `gender`
  MODIFY `gendr_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `icd_code`
--
ALTER TABLE `icd_code`
  MODIFY `icd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `investigation`
--
ALTER TABLE `investigation`
  MODIFY `invest_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `investigation_details`
--
ALTER TABLE `investigation_details`
  MODIFY `investd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `inv_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `medical_notes`
--
ALTER TABLE `medical_notes`
  MODIFY `md_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `our_plan`
--
ALTER TABLE `our_plan`
  MODIFY `plan_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `patient`
--
ALTER TABLE `patient`
  MODIFY `pat_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `pay_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymode`
--
ALTER TABLE `paymode`
  MODIFY `paym_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `prescription`
--
ALTER TABLE `prescription`
  MODIFY `prs_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `prescription_details`
--
ALTER TABLE `prescription_details`
  MODIFY `prsd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `p_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `relation`
--
ALTER TABLE `relation`
  MODIFY `r_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `r_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sessionyear`
--
ALTER TABLE `sessionyear`
  MODIFY `sy_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subcription_plan`
--
ALTER TABLE `subcription_plan`
  MODIFY `sbcp_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `subscription_plan_history`
--
ALTER TABLE `subscription_plan_history`
  MODIFY `history_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `taxpercent`
--
ALTER TABLE `taxpercent`
  MODIFY `txp_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tax_type`
--
ALTER TABLE `tax_type`
  MODIFY `txt_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tests`
--
ALTER TABLE `tests`
  MODIFY `test_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `test_type`
--
ALTER TABLE `test_type`
  MODIFY `tt_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `times`
--
ALTER TABLE `times`
  MODIFY `t_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `unit`
--
ALTER TABLE `unit`
  MODIFY `uid` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_rights`
--
ALTER TABLE `user_rights`
  MODIFY `ur_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `voucher_type`
--
ALTER TABLE `voucher_type`
  MODIFY `vhr_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
