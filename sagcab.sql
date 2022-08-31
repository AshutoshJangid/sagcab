-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 17, 2021 at 09:36 AM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sagcab`
--

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `status` enum('1','0') DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `driving_licence` varchar(100) DEFAULT NULL,
  `taxi_no` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `first_name`, `middle_name`, `last_name`, `username`, `password`, `email`, `mobile`, `address`, `latitude`, `longitude`, `status`, `device_id`, `device_type`, `driving_licence`, `taxi_no`, `created_at`, `updated_at`) VALUES
(1, 'babulal', NULL, 'saini', 'babulalg', '$2a$08$RqXAoP./m6e8ireykISnr.WyuettzWkw7rKPJ27bltl4Zf6wxmGZ6', 'sagdeveloper2@gmail.com', '1234567891', NULL, 26.8809, 75.8055, '1', 'dffdfd', NULL, NULL, NULL, '2021-10-07 08:41:20', '2021-10-18 08:56:10'),
(2, 'babulal', NULL, 'saini', 'babulals', '$2a$08$DPqufBt0X2VhNbr4lTIj9OKnZ.oZo/.14aVa62YyV0Vt0lP2KWCdW', 'sagdeveloper21@gmail.com', '1234522891', NULL, 26.9196, 75.788, '1', 'dffdfd', NULL, NULL, NULL, '2021-10-07 09:02:59', '2021-10-18 08:57:22'),
(3, 'Keshav', NULL, 'Kumar', 'test1', '$2a$08$IELfp3lNHCnF6KUR.P2...rKmYZhRnpS.a3Ac9y/4QSNSRE7FKwCa', 'test1@gmail.com', '9632587410', NULL, 30.6883, 76.4095, '1', '84845448', NULL, NULL, NULL, '2021-10-07 10:19:11', '2021-10-18 09:02:53'),
(4, 'Keshav', NULL, 'Kumar', 'test2', '$2a$08$M/k70feLrLiQmDWH.9ILYOhX7TfQYGm8KkskVF.ppJDn8czPFcOF.', 'test2@gmail.com', '9632587412', NULL, 26.9004, 76.3306, '1', '84845448', NULL, NULL, NULL, '2021-10-07 10:42:08', '2021-10-18 09:05:15'),
(5, 'freweewfe', NULL, 'ewewffew', '3698521479', '$2a$08$tyY6Z25XHQg5.8A6RWIxIeqrL1lPc7jo.H/srHzh7NPiIjNlJnjl2', 'testxyz@gmail.com', '3698521479', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, NULL, NULL, '2021-10-07 13:03:35', NULL),
(6, 'keshav', NULL, 'Kumar', '3698521470', '$2a$08$I9n5vZ49PYDctrQbpRVY1OHsjwScurKanS08.msVTGaETuv7lUBZO', 'test6@gmail.com', '3698521470', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, NULL, NULL, '2021-10-07 13:15:37', NULL),
(7, 'wefefef', NULL, 'fewewrf', '3698520147', '$2a$08$PCWsXnYJwCGIR8l3VbaCY.2wQesNyfX5YYSCN0zt2qWj1hxNeHPKi', 'test0@gmail.com', '3698520147', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, NULL, NULL, '2021-10-07 13:24:54', NULL),
(8, 'Keshav', NULL, 'Kumar', 'sag9', '$2a$08$JtQIgJpCa.UNZkkKCx/aGegQy04E/sRaHSqAXsoxezG.p2JP59qlO', 'sag9@gmail.com', '9632585519', NULL, NULL, NULL, '1', '84845448', NULL, 'huefwewh', '55555255', '2021-10-11 04:38:28', NULL),
(9, 'Keshav', NULL, 'Kumar', 'sag11', '$2a$08$LDnGov4syeEns7ZEijVOUermivFrUbUhPDWZ1bpvoKdfugDzW8OSi', 'sag11@gmail.com', '9632585509', NULL, NULL, NULL, '1', '84845448', NULL, 'huefwewh', '55555200', '2021-10-11 05:04:51', NULL),
(10, 'ffffff', NULL, 'fffff', '4568529510', '$2a$08$38Nz8.683w/nBogijWhqCeQgK2.yDFLUcb0Su9uIjna6Qk2mnsslK', 'driver1@gmail.com', '4568529510', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'undefined', 'undefined', '2021-10-11 05:05:34', NULL),
(11, 'Keshav', NULL, 'Kumar', 'sag1122', '$2a$08$vMO20T3pIaMY56cQZERexek41OgyxzqirJMSYeHBFiLJMYj7IjSHi', 'sag221@gmail.com', '9632085509', NULL, NULL, NULL, '1', '84845448', NULL, 'huefwewh', '5555527', '2021-10-11 05:12:07', NULL),
(12, 'e3r3r2rr2', NULL, 'r23rr4r4r23r3', '8525269301', '$2a$08$b9NN8J2vqkasoPIfos94C.SuIorUq1/NC6ql5w3gfRgTQ/n3TaKiS', 'driver5@gmail.com', '8525269301', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'e3r3rrr', '123544', '2021-10-11 05:20:23', NULL),
(13, 'rewgr', NULL, 'gregr', '8529630147', '$2a$08$X.gAOlRo1B2ETdjMxor/euQCgFFbDA74I3haTgIoxGyA3crut5r6e', 'test333@gmail.com', '8529630147', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '8585252', '55255', '2021-10-11 06:23:44', NULL),
(14, 'rerrrfer', NULL, 'errergr', '8523697410', '$2a$08$mLN0OEf65hPk3XYeAZa1o.V6XBaIYh4RUD6vSPW0CtA2JhYD/advS', '1@gmail.com', '8523697410', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '3434434', '34t4f3', '2021-10-11 08:01:51', NULL),
(15, 'ffeeeref', NULL, 'fffeefef', '7896541590', '$2a$08$Pp.vZPgmd8DyU2CpSa9l4u7iR13O1OKeGHh22O.0Prvk6cQndu5l6', '2@gmail.com', '7896541590', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'ferfeferef', 'feklewkmfkmfe', '2021-10-11 08:26:38', NULL),
(16, 'ffeeeref', NULL, 'fffeefef', '7896541591', '$2a$08$GKNQJ0AtFa5DCMBFRGmTceLJQdIOd9S9cXR1x66bl8.f6cu7gACRe', '3@gmail.com', '7896541591', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'ferfefedd', 'feklewkmfdd', '2021-10-11 08:29:40', NULL),
(17, 'efwefefef', NULL, 'fewefwef', '7896455210', '$2a$08$Y.0nHt7opKdLwK2Fiz1y2umHWKgS9SZRhGb6Pc5DbDAUSsXf1pMra', '4@gmail.com', '7896455210', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewefwfe', 'ererwfefe', '2021-10-11 08:41:30', NULL),
(18, 'efwefefef', NULL, 'fewefwef', '7896455456', '$2a$08$bWvoQdhKR/hFpJwmHgOupuusqfiNlZJQM9UaxWBKloG8DIKaMpy7m', '6@gmail.com', '7896455456', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewefwfe55', 'ererwfefe55', '2021-10-11 08:42:28', NULL),
(19, 'efwefefef', NULL, 'fewefwef', '7896455222', '$2a$08$hnhUeg9WRDs05HyDmsxWX.2j9ABM5HFnIYO9.hGYUJ9gAWBe3pQ9y', '7@gmail.com', '7896455222', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewefwfe5555', 'ererwfefjjkk', '2021-10-11 08:49:40', NULL),
(20, 'efwefefef', NULL, 'fewefwef', '7896454811', '$2a$08$YwrjBYWVv5tA6OkBH3sf1.CBRXvFV3u2VwfJRXgPF2cy4i6wuptu6', '07@gmail.com', '7896454811', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewef', 'ererwfefjddd', '2021-10-11 08:50:29', NULL),
(21, 'efwefefef', NULL, 'fewefwef', '7896454800', '$2a$08$tQdQmkOeONfTa84rbT/kCOm6.xS1gsOXYInyVJfUmxl51Wao7Saaa', '90@gmail.com', '7896454800', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewttt', 'ererwfefjuuu', '2021-10-11 08:51:46', NULL),
(22, 'Keshav', NULL, 'Kumar', 'sag1122wwew', '$2a$08$CEdAf.wsSASh1RLV.NaY1u1BwxPqE6RADePsDy9ophi5Qqsp2tQdK', 'sag7@gmail.com', '9632225509', NULL, NULL, NULL, '1', '84845448', NULL, 'huefwewh', '55555275454', '2021-10-11 09:10:13', NULL),
(23, 'efwefefef', NULL, 'fewefwef', '7896454888', '$2a$08$ECH9DAfK4cHR/3V7Vtr/4OsYCf0DtC06zIie9JjAO0iHXPlHbYKMW', '9008@gmail.com', '7896454888', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewttererww', 'ererwfefjefe', '2021-10-11 09:13:36', NULL),
(24, 'efwefefef', NULL, 'fewefwef', '7896454786', '$2a$08$YtP/G2X8q3M50iWkWDx1seXZuO.K3OxGRrjtcR6Cg4Yw9LgNYVd8m', '9044@gmail.com', '7896454786', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewttererww44', 'ererwfefjefe444', '2021-10-11 09:20:24', NULL),
(25, 'efwefefef', NULL, 'fewefwef', '7896454550', '$2a$08$3SVnmsljQakqYMY.zKkQhe9nvEiTbZ2huJ9M6j7MvqdRtIYS2j0WC', '90dd@gmail.com', '7896454550', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewttererww44dd', 'ererwfefjefe444dd', '2021-10-11 09:26:46', NULL),
(26, 'efwefefef', NULL, 'fewefwef', '7896454123', '$2a$08$cFxUJKVYSZzL9nCcvtJiGOC5OljAANyy32i5xcPKPL9mJTypUXEY6', '9055@gmail.com', '7896454123', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewtterers', 'ererwfefjefe44sss', '2021-10-11 09:29:20', NULL),
(27, 'efwefefef', NULL, 'fewefwef', '7896454788', '$2a$08$kmdrw5LP9FJP7avkP6KcIepWiWEVnAdWapz4nr.HomqkWJQYcuQZ2', '9088@gmail.com', '7896454788', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'fewfewtterersdd', 'ererwfefjef', '2021-10-11 09:30:30', NULL),
(28, 'Keshav', NULL, 'Kumar', 'sag1ew', '$2a$08$SXL9R8YGHJl/./vj2939cuDkoNRTa5KELCCslk/ua7qMhljiw/SRq', 'sag12@gmail.com', '9632225511', NULL, NULL, NULL, '1', '232443243545456552323244343', NULL, 'hjjksxh', '5555785454', '2021-10-12 04:36:53', '2021-10-12 04:39:12'),
(29, 'Keshav', NULL, 'Kumar', '7531595500', '$2a$08$NKF3m5DdIExs/vq7n6NmY.JtKrk7HbVdlsn8XTDD2js/ZsiJKWPZ2', 'testxapp@gmail.com', '7531595500', NULL, 26.8605, 75.793, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, 'tyyyuyuu', 'frghhjughh', '2021-10-12 04:56:15', '2021-11-16 06:25:10');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `destination_latitude` float DEFAULT NULL,
  `destination_longitude` float DEFAULT NULL,
  `status` enum('1','0') NOT NULL COMMENT '1 for Accept, 0 for Decline',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `status` enum('1','0') DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `middle_name`, `last_name`, `username`, `password`, `email`, `mobile`, `address`, `latitude`, `longitude`, `status`, `device_id`, `device_type`, `created_at`, `updated_at`) VALUES
(1, 'babulal', NULL, 'saini', 'babulalg', '$2a$08$QBZTBbiRWZ9kuL7yoYvkqeEQGCnYBFdgitMxE1MdPErnp8Ar/h/J6', 'sagdeveloper2@gmail.com', '1234567891', NULL, 5.21132, 4.4652, '1', '23232', NULL, '2021-10-05 11:28:12', '2021-11-17 07:06:26'),
(2, 'keshav', NULL, 'kumar', 'keshavtest', '$2a$08$1Sjn4oqhzCAqdZQlEHChKuOhEyt8RqS25roTTZmwmH0p0JMAzBXh6', 'test3@gmail.com', '7979727200', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-05 11:39:36', '2021-10-05 12:23:56'),
(3, 'Keshav ', NULL, 'kumars', 'keshavtest3', '$2a$08$StxCQK.q3FcE1RO7O1YAveUb6v90MyouDvmqPVT75KkuIIDQVpAQy', 'test4@gmail.com', '7979727204', NULL, NULL, NULL, '1', '84452526878465265484', NULL, '2021-10-05 11:45:48', '2021-10-05 12:08:54'),
(4, 'jkedfee', NULL, 'efwffefw', '88522145645', '$2a$08$j3N6TqTU/WwkxqEZ/rmsO.DvtlrPA/W7xNb1eZxlC.tugUs5UlWF.', 'test@gmail.com', '8852214564', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-08 06:49:37', NULL),
(5, 'ferfrrf', NULL, 'fgrgrggr', '8521469700', '$2a$08$XCKoiIl2THtq1F7g.2dqx.3Xc16DlTMLw04OJPFL7eEWHhr.dUYkG', 'testapp@gmail.com', '8521469700', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-08 06:58:42', NULL),
(6, 'ffewfwew', NULL, 'eeweweweew', '7896541235', '$2a$08$cQ16PRr1AK90XHGe3fNH6O7LOt.BiDNLb2q8AjcY5KYys9pMViopW', 'test66@gmail.com', '7896541235', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 06:37:42', NULL),
(7, 'ewffe', NULL, 'efeefwef', '78965485250', '$2a$08$a6zSaCx9b.f1c/lKt4CvpetxlR4RDNJ9aJCqEUBR3SvQPPghRw9Q6', 'test003', '7896548525', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 06:50:18', NULL),
(8, 'grfvffdfv', NULL, 'fvffv', '9513574862', '$2a$08$Rj/hhxXbJRkDKoJs3evGceoGRJl.Gh5/YsVYdcne7SULWnpGsX182', 'test786@gmail', '9513574862', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 07:04:59', NULL),
(9, 'huede', NULL, 'efqeffe', '7896548574', '$2a$08$jqfBGscE3GcaxvznLnKGdu4Ogh7b5sz/lw7yhpCC0H9hemSauLDiW', '1@gmail.com', '7896548574', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 07:10:42', NULL),
(10, 'dddddd', NULL, 'dddddd', '7896547896', '$2a$08$rsDZWvZyLKp62AglTQYou.0YopE5Vr59pjHOHCMt68tzPF4d/vNHq', '5@gmail.com', '7896547896', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 09:39:25', NULL),
(11, 'ededede', NULL, 'dqwded', '8521447306', '$2a$08$mYorgga6F4YUz9ab6H2zs.mx8E67sjU6EcWu.5zy44yLgv4wlLLI6', '7@gmail.com', '8521447306', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 09:57:55', NULL),
(12, 'eeffef', NULL, 'fefwfefeefew', '8523690101', '$2a$08$7bTmWKm4BA73BPT6hJJf3uveZc5fnyAqxCr2/qDEW3kQgUYB1dgo6', '8@gmail.com', '8523690101', NULL, NULL, NULL, '1', '5130F8F5-5D85-4D20-805F-7AC514655222', NULL, '2021-10-11 10:15:06', NULL),
(13, 'Keshav', NULL, 'Kumar', '8521463907', '$2a$08$S1b5PzSwa.vOHjwZiTijIuO0A2eJqmRj2DxmoP8YObZYksgoTkhNS', 'testxapp@gmail.com', '8521463907', NULL, 26.8605, 75.793, '1', 'F3E80710-4D01-4BF4-B961-4703E662EC4F', NULL, '2021-10-12 04:27:39', '2021-11-17 05:24:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
