// Teltonika Codec 8 and Codec 8 Extended parser
// Protocol reference: https://wiki.teltonika-gps.com/view/Codec

const CODEC_8 = 0x08;
const CODEC_8E = 0x8E;

// FMC150 I/O element ID mapping
// https://wiki.teltonika-gps.com/view/FMC150_Parameter_list
// Source: https://wiki.teltonika-gps.com/view/FMC150_Teltonika_Data_Sending_Parameters_ID
const IO_NAMES = {
  // Digital I/O
  1:   { name: 'digital_input_1',           unit: 'bool' },
  2:   { name: 'digital_input_2',           unit: 'bool' },
  3:   { name: 'digital_input_3',           unit: 'bool' },
  4:   { name: 'pulse_counter_din1',        unit: 'raw' },
  5:   { name: 'pulse_counter_din2',        unit: 'raw' },
  6:   { name: 'analog_input_2',            unit: 'mV', scale: 0.001, unitLabel: 'V' },
  9:   { name: 'analog_input_1',            unit: 'mV', scale: 0.001, unitLabel: 'V' },
  10:  { name: 'sd_status',                 unit: 'bool' },
  11:  { name: 'iccid1',                    unit: 'raw' },
  12:  { name: 'fuel_used_gps',             unit: 'l',  scale: 0.001, unitLabel: 'l' },
  13:  { name: 'fuel_rate_gps',             unit: 'l/100km', scale: 0.01 },
  14:  { name: 'iccid2',                    unit: 'raw' },
  15:  { name: 'eco_score',                 unit: 'raw', scale: 0.01 },
  16:  { name: 'total_odometer',            unit: 'm' },
  17:  { name: 'axis_x',                    unit: 'mG' },
  18:  { name: 'axis_y',                    unit: 'mG' },
  19:  { name: 'axis_z',                    unit: 'mG' },
  20:  { name: 'ble_battery_2',             unit: '%' },
  21:  { name: 'gsm_signal',                unit: 'raw' },
  22:  { name: 'ble_battery_3',             unit: '%' },
  23:  { name: 'ble_battery_4',             unit: '%' },
  24:  { name: 'speed',                     unit: 'km/h' },
  // BLE sensors
  25:  { name: 'ble_temperature_1',         unit: '°C', scale: 0.01 },
  26:  { name: 'ble_temperature_2',         unit: '°C', scale: 0.01 },
  27:  { name: 'ble_temperature_3',         unit: '°C', scale: 0.01 },
  28:  { name: 'ble_temperature_4',         unit: '°C', scale: 0.01 },
  29:  { name: 'ble_battery_1',             unit: '%' },
  // OBD-II
  30:  { name: 'obd_dtc_count',             unit: 'raw' },
  31:  { name: 'obd_engine_load',           unit: '%' },
  32:  { name: 'obd_coolant_temp',          unit: '°C' },
  33:  { name: 'obd_short_fuel_trim',       unit: '%' },
  34:  { name: 'obd_fuel_pressure',         unit: 'kPa' },
  35:  { name: 'obd_intake_map',            unit: 'kPa' },
  36:  { name: 'obd_engine_rpm',            unit: 'rpm' },
  37:  { name: 'obd_speed',                 unit: 'km/h' },
  38:  { name: 'obd_timing_advance',        unit: 'raw' },
  39:  { name: 'obd_intake_air_temp',       unit: '°C' },
  40:  { name: 'obd_maf',                   unit: 'g/s', scale: 0.01 },
  41:  { name: 'obd_throttle',              unit: '%' },
  42:  { name: 'obd_runtime',               unit: 's' },
  43:  { name: 'obd_dist_mil_on',           unit: 'km' },
  44:  { name: 'obd_rel_fuel_pressure',     unit: 'kPa', scale: 0.1 },
  45:  { name: 'obd_dir_fuel_pressure',     unit: 'kPa', scale: 10 },
  46:  { name: 'obd_commanded_egr',         unit: '%' },
  47:  { name: 'obd_egr_error',             unit: '%' },
  48:  { name: 'obd_fuel_level',            unit: '%' },
  49:  { name: 'obd_dist_codes_clear',      unit: 'km' },
  50:  { name: 'obd_baro_pressure',         unit: 'kPa' },
  51:  { name: 'obd_control_voltage',       unit: 'V', scale: 0.001 },
  52:  { name: 'obd_abs_load',              unit: '%' },
  53:  { name: 'obd_ambient_temp',          unit: '°C' },
  54:  { name: 'obd_time_mil_on',           unit: 'min' },
  55:  { name: 'obd_time_codes_clear',      unit: 'min' },
  56:  { name: 'obd_abs_fuel_pressure',     unit: 'kPa', scale: 0.1 },
  57:  { name: 'obd_hybrid_battery',        unit: '%' },
  58:  { name: 'obd_oil_temp',              unit: '°C' },
  59:  { name: 'obd_fuel_injection_timing', unit: 'raw' },
  60:  { name: 'obd_fuel_rate',             unit: 'l/h', scale: 0.01 },
  // Geofence zones 06-10
  61:  { name: 'geofence_zone_06',          unit: 'raw' },
  62:  { name: 'geofence_zone_07',          unit: 'raw' },
  63:  { name: 'geofence_zone_08',          unit: 'raw' },
  64:  { name: 'geofence_zone_09',          unit: 'raw' },
  65:  { name: 'geofence_zone_10',          unit: 'raw' },
  // Power
  66:  { name: 'external_voltage',          unit: 'V', scale: 0.001 },
  67:  { name: 'battery_voltage',           unit: 'V', scale: 0.001 },
  68:  { name: 'battery_current',           unit: 'A', scale: 0.001 },
  // GNSS
  69:  { name: 'gnss_status',               unit: 'enum', values: { 0: 'off', 1: 'no_fix', 2: 'fix_2d', 3: 'fix_3d' } },
  70:  { name: 'geofence_zone_11',          unit: 'raw' },
  // Dallas 1-wire
  71:  { name: 'dallas_id_4',               unit: 'raw' },
  72:  { name: 'dallas_temp_1',             unit: '°C', scale: 0.1 },
  73:  { name: 'dallas_temp_2',             unit: '°C', scale: 0.1 },
  74:  { name: 'dallas_temp_3',             unit: '°C', scale: 0.1 },
  75:  { name: 'dallas_temp_4',             unit: '°C', scale: 0.1 },
  76:  { name: 'dallas_id_1',               unit: 'raw' },
  77:  { name: 'dallas_id_2',               unit: 'raw' },
  78:  { name: 'ibutton',                   unit: 'raw' },
  79:  { name: 'dallas_id_3',               unit: 'raw' },
  // Data mode
  80:  { name: 'data_mode',                 unit: 'enum', values: { 0: 'home', 1: 'roaming', 2: 'unknown', 3: 'home_stby', 4: 'roaming_stby' } },
  // CAN bus
  81:  { name: 'can_speed',                 unit: 'km/h' },
  82:  { name: 'can_throttle',              unit: '%' },
  83:  { name: 'can_fuel_consumption',      unit: 'l', scale: 0.1 },
  84:  { name: 'can_fuel_level',            unit: 'l', scale: 0.1 },
  85:  { name: 'can_engine_rpm',            unit: 'rpm' },
  86:  { name: 'engine_total_fuel_used',    unit: 'l' },
  87:  { name: 'fuel_level',                unit: '%' },
  88:  { name: 'engine_speed',              unit: 'rpm' },
  89:  { name: 'axle_weight_1',             unit: 'kg' }, // was foutief 'can_fuel_level_pct' (%) - FMS axle data, geen CAN fuel level
  // Engine / CAN extended
  91:  { name: 'axle_weight_3',             unit: 'kg' }, // was foutief 'geofence_zone_13'
  92:  { name: 'axle_weight_4',             unit: 'kg' }, // was foutief 'geofence_zone_14'
  93:  { name: 'axle_weight_5',             unit: 'kg' }, // was foutief 'geofence_zone_15'
  94:  { name: 'axle_weight_6',             unit: 'kg' }, // was foutief 'geofence_zone_16'
  95:  { name: 'axle_weight_7',             unit: 'kg' }, // was foutief 'geofence_zone_17'
  96:  { name: 'axle_weight_8',             unit: 'kg' }, // was foutief 'geofence_zone_18'
  97:  { name: 'axle_weight_9',             unit: 'kg' },
  98:  { name: 'axle_weight_10',            unit: 'kg' },
  99:  { name: 'axle_weight_11',            unit: 'kg' },
  102: { name: 'axle_weight_14',            unit: 'kg' },
  103: { name: 'axle_weight_15',            unit: 'kg' },
  104: { name: 'engine_total_hours',        unit: 'h' },
  105: { name: 'total_mileage_counted',     unit: 'm' },
  106: { name: 'ble_humidity_3',            unit: '%RH', scale: 0.1 },
  107: { name: 'fuel_consumed_counted',     unit: 'l', scale: 0.1 },
  108: { name: 'ble_humidity_4',            unit: '%RH', scale: 0.1 },
  113: { name: 'battery_level',             unit: '%' },
  114: { name: 'engine_torque',             unit: '%' },
  115: { name: 'can_coolant_temp',          unit: '°C', scale: 0.1 },
  // Geofence zones
  153: { name: 'geofence_zone_22',          unit: 'raw' },
  154: { name: 'geofence_zone_23',          unit: 'raw' },
  155: { name: 'geofence_zone_01',          unit: 'raw' },
  156: { name: 'geofence_zone_02',          unit: 'raw' },
  157: { name: 'geofence_zone_03',          unit: 'raw' },
  158: { name: 'geofence_zone_04',          unit: 'raw' },
  159: { name: 'geofence_zone_05',          unit: 'raw' },
  175: { name: 'auto_geofence',             unit: 'raw' },
  // Digital outputs
  179: { name: 'digital_output_1',          unit: 'bool' },
  180: { name: 'digital_output_2',          unit: 'bool' },
  181: { name: 'gnss_pdop',                 unit: 'raw', scale: 0.1 },
  182: { name: 'gnss_hdop',                 unit: 'raw', scale: 0.1 },
  190: { name: 'tachograph_reserved_190',   unit: 'raw' },
  191: { name: 'tachograph_vehicle_speed',  unit: 'km/h' },
  192: { name: 'tachograph_odometer',       unit: 'm' },
  193: { name: 'tachograph_trip_distance',  unit: 'm' },
  194: { name: 'tachograph_timestamp',      unit: 'raw' },
  195: { name: 'driver1_card_id_part1',     unit: 'ascii8' }, // FMS Driver1 card identification deel 1 (was foutief 'geofence_zone_29')
  196: { name: 'driver1_card_id_part2',     unit: 'ascii8' }, // FMS Driver1 card identification deel 2 (was foutief 'geofence_zone_30')
  197: { name: 'driver2_card_id_part1',     unit: 'ascii8' },
  198: { name: 'driver2_card_id_part2',     unit: 'ascii8' },
  199: { name: 'trip_odometer',             unit: 'm' },
  200: { name: 'sleep_mode',                unit: 'enum', values: { 0: 'no_sleep', 1: 'gps_sleep', 2: 'deep_sleep', 3: 'online_deep_sleep', 4: 'ultra_deep_sleep' } },
  // LLS fuel level sensors
  201: { name: 'lls1_fuel_level',           unit: 'raw' },
  202: { name: 'lls1_temperature',          unit: '°C' },
  203: { name: 'lls2_fuel_level',           unit: 'raw' },
  204: { name: 'lls2_temperature',          unit: '°C' },
  // GSM
  205: { name: 'gsm_cell_id',               unit: 'raw' },
  206: { name: 'gsm_area_code',             unit: 'raw' },
  207: { name: 'rfid',                      unit: 'raw' },
  208: { name: 'geofence_zone_33',          unit: 'raw' },
  209: { name: 'geofence_zone_34',          unit: 'raw' },
  210: { name: 'lls3_fuel_level',           unit: 'raw' },
  211: { name: 'lls3_temperature',          unit: '°C' },
  212: { name: 'lls4_fuel_level',           unit: 'raw' },
  213: { name: 'lls4_temperature',          unit: '°C' },
  214: { name: 'lls5_fuel_level',           unit: 'raw' },
  215: { name: 'lls5_temperature',          unit: '°C' },
  216: { name: 'total_odometer',            unit: 'm' },
  217: { name: 'rfid_com2',                 unit: 'raw' },
  218: { name: 'imsi',                      unit: 'raw' },
  219: { name: 'ccid_part1',                unit: 'raw' },
  220: { name: 'ccid_part2',                unit: 'raw' },
  221: { name: 'ccid_part3',                unit: 'raw' },
  222: { name: 'card1_issuing_member_state', unit: 'raw' },
  223: { name: 'card2_issuing_member_state', unit: 'raw' },
  224: { name: 'ultrasonic_fuel_level_1',   unit: 'mm', scale: 0.1 },
  225: { name: 'ultrasonic_fuel_level_2',   unit: 'mm', scale: 0.1 },
  226: { name: 'cng_status',                unit: 'bool' },
  227: { name: 'cng_used',                  unit: 'kg' },
  228: { name: 'cng_level',                 unit: '%' },
  229: { name: 'adblue_status',             unit: 'raw' },
  230: { name: 'tachograph_reserved_230',   unit: 'raw' },
  231: { name: 'vehicle_registration_number_part1', unit: 'ascii8' }, // FMS kenteken deel 1 (was foutief 'geofence_zone_50')
  // Trip / events
  236: { name: 'alarm',                     unit: 'bool' },
  237: { name: 'network_type',              unit: 'raw' },
  238: { name: 'user_id',                   unit: 'raw' },
  239: { name: 'ignition',                  unit: 'bool' },
  240: { name: 'movement',                  unit: 'bool' },
  241: { name: 'active_gsm_operator',       unit: 'raw' },
  243: { name: 'green_driving_duration',    unit: 'ms' },
  246: { name: 'towing',                    unit: 'bool' },
  247: { name: 'crash_detection',           unit: 'bool' },
  248: { name: 'immobilizer',               unit: 'raw' },
  249: { name: 'jamming',                   unit: 'bool' },
  250: { name: 'trip',                      unit: 'bool' },
  251: { name: 'idling',                    unit: 'bool' },
  252: { name: 'unplug',                    unit: 'bool' },
  253: { name: 'green_driving_type',        unit: 'raw' },
  254: { name: 'green_driving_value',       unit: 'raw' },
  255: { name: 'overspeeding',              unit: 'raw' },
  256: { name: 'vin',                       unit: 'raw' },
  257: { name: 'crash_trace_buffer',        unit: 'raw' },
  258: { name: 'eco_maximum',               unit: 'accel_xyz' },
  259: { name: 'eco_average',               unit: 'accel_xyz' },
  260: { name: 'eco_duration',              unit: 'ms' },
  263: { name: 'bt_status',                 unit: 'raw' },
  // Escort LLS sensors
  269: { name: 'escort_lls_temp_1',         unit: '°C' },
  270: { name: 'escort_lls_fuel_1',         unit: 'raw' },
  271: { name: 'escort_lls_batt_1',         unit: 'V', scale: 0.001 },
  272: { name: 'escort_lls_temp_2',         unit: '°C' },
  273: { name: 'escort_lls_fuel_2',         unit: 'raw' },
  274: { name: 'escort_lls_batt_2',         unit: 'V', scale: 0.001 },
  275: { name: 'escort_lls_temp_3',         unit: '°C' },
  276: { name: 'escort_lls_fuel_3',         unit: 'raw' },
  277: { name: 'escort_lls_batt_3',         unit: 'V', scale: 0.001 },
  278: { name: 'escort_lls_temp_4',         unit: '°C' },
  279: { name: 'escort_lls_fuel_4',         unit: 'raw' },
  280: { name: 'escort_lls_batt_4',         unit: 'V', scale: 0.001 },
  264: { name: 'barcode_id',                unit: 'raw' },
  281: { name: 'fault_codes',               unit: 'raw' },
  283: { name: 'driving_state',             unit: 'raw' },
  284: { name: 'driving_records',           unit: 'raw' },
  285: { name: 'blood_alcohol_content',     unit: 'raw' },
  // BLE Fuel Frequency
  306: { name: 'ble_fuel_freq_1',           unit: 'raw' },
  307: { name: 'ble_fuel_freq_2',           unit: 'raw' },
  308: { name: 'ble_fuel_freq_3',           unit: 'raw' },
  309: { name: 'ble_fuel_freq_4',           unit: 'raw' },
  303: { name: 'instant_movement',          unit: 'bool' },
  317: { name: 'crash_event_counter',       unit: 'raw' },
  325: { name: 'vin_lvcan',                 unit: 'raw' },
  327: { name: 'ul202_fuel_level',          unit: 'raw' },
  329: { name: 'ain_speed',                 unit: 'raw' },
  // BLE Luminosity
  335: { name: 'ble_luminosity_1',          unit: 'lx' },
  336: { name: 'ble_luminosity_2',          unit: 'lx' },
  337: { name: 'ble_luminosity_3',          unit: 'lx' },
  338: { name: 'ble_luminosity_4',          unit: 'lx' },
  380: { name: 'digital_output_3',          unit: 'bool' },
  381: { name: 'ground_sense',              unit: 'bool' },
  385: { name: 'beacon',                    unit: 'raw' },
  387: { name: 'iso6709_coordinates',       unit: 'raw' },
  391: { name: 'private_mode',              unit: 'raw' },
  400: { name: 'dist_next_service',         unit: 'raw' },
  403: { name: 'driver_name',               unit: 'raw' },
  404: { name: 'driver_card_license_type',  unit: 'raw' },
  405: { name: 'driver_gender',             unit: 'raw' },
  406: { name: 'driver_card_id',            unit: 'raw' },
  407: { name: 'driver_card_expiry',        unit: 'raw' },
  408: { name: 'driver_card_place_issued',  unit: 'raw' },
  409: { name: 'driver_status_event',       unit: 'raw' },
  449: { name: 'ignition_on_counter',       unit: 's' },
  483: { name: 'ul202_sensor_status',       unit: 'raw' },
  500: { name: 'msp500_vendor',             unit: 'raw' },
  501: { name: 'msp500_vehicle_number',     unit: 'raw' },
  502: { name: 'msp500_speed_sensor',       unit: 'bool' },
  543: { name: 'hybrid_voltage',            unit: 'V' },
  544: { name: 'hybrid_current',            unit: 'A' },
  622: { name: 'freq_din1',                 unit: 'Hz', scale: 0.1 },
  623: { name: 'freq_din2',                 unit: 'Hz', scale: 0.1 },
  636: { name: 'lte_cell_id',               unit: 'raw' },
  637: { name: 'wake_reason',               unit: 'raw' },
  653: { name: 'parking_brake',             unit: 'bool' },
  654: { name: 'door_front_left',           unit: 'bool' },
  655: { name: 'door_front_right',          unit: 'bool' },
  656: { name: 'door_rear_left',            unit: 'bool' },
  657: { name: 'door_rear_right',           unit: 'bool' },
  658: { name: 'trunk_status',              unit: 'bool' },
  659: { name: 'gear_neutral',              unit: 'bool' },
  660: { name: 'gear_park',                 unit: 'bool' },
  661: { name: 'gear_reverse',              unit: 'bool' },
  662: { name: 'central_lock',              unit: 'bool' },
  759: { name: 'fuel_type',                 unit: 'raw' },
  866: { name: 'remaining_distance',        unit: 'km' },
  910: { name: 'brake_switch',              unit: 'bool' },
  911: { name: 'clutch_switch',             unit: 'bool' },
  913: { name: 'bonnet_status',             unit: 'bool' },
  914: { name: 'charge_cable_plugged',      unit: 'bool' },
  915: { name: 'hv_battery_charge_state',   unit: 'raw' },
  927: { name: 'gear_drive',                unit: 'bool' },
  928: { name: 'lamp_side',                 unit: 'bool' },
  929: { name: 'lamp_dimmed',               unit: 'bool' },
  930: { name: 'lamp_reflector',            unit: 'bool' },
  931: { name: 'lamp_fog_rear',             unit: 'bool' },
  932: { name: 'lamp_fog_front',            unit: 'bool' },
  936: { name: 'ac_on',                     unit: 'bool' },
  937: { name: 'cruise_control',            unit: 'bool' },
  940: { name: 'seatbelt_front_left',       unit: 'bool' },
  941: { name: 'seatbelt_front_right',      unit: 'bool' },
  942: { name: 'seatbelt_rear_left',        unit: 'bool' },
  943: { name: 'seatbelt_rear_right',       unit: 'bool' },
  944: { name: 'seatbelt_rear_center',      unit: 'bool' },
  946: { name: 'pto_state',                 unit: 'raw' },
  956: { name: 'esp_enabled',               unit: 'bool' },
  1112: { name: 'ev_hv_battery_voltage',    unit: 'V' },
  1113: { name: 'ev_hv_battery_current',    unit: 'A' },
  1116: { name: 'max_road_speed',           unit: 'raw' },
  1117: { name: 'exceeded_road_speed',      unit: 'raw' },
  1137: { name: 'steering_wheel_angle',     unit: 'raw' },
  1148: { name: 'io_1148',                  unit: 'raw' },
  1161: { name: 'imei',                     unit: 'raw' },
  1155: { name: 'hv_consumed_energy',       unit: 'kWh', scale: 0.01 },
  1156: { name: 'hv_recuperated_energy',    unit: 'kWh', scale: 0.01 },
  1157: { name: 'ev_hv_battery_power',      unit: 'kW', scale: 0.1 },
  1158: { name: 'engine_oil_pressure',      unit: 'kPa' },
  1159: { name: 'engine_oil_level',         unit: '%' },
  1358: { name: 'steering_wheel_dir_left',   unit: 'bool' },
  1359: { name: 'steering_wheel_dir_right',  unit: 'bool' },
  1360: { name: 'ev_eco_switch',             unit: 'bool' },
  1362: { name: 'door_status_all',           unit: 'raw' },
  1396: { name: 'ambient_air_temp_2',        unit: '°C' },
  1413: { name: 'turn_signal_left',          unit: 'bool' },
  1414: { name: 'turn_signal_right',         unit: 'bool' },
  1415: { name: 'charge_port_flap',          unit: 'bool' },
  1418: { name: 'electric_motor_temp',       unit: '°C' },
  13201: { name: 'pcb_temperature',          unit: '°C', scale: 0.01 },
  1205: { name: 'speed_sign_recognized',    unit: 'bool' },
  1207: { name: 'speed_sign_exceeded',      unit: 'bool' },
  1220: { name: 'gross_vehicle_weight',     unit: 'kg', scale: 10 },
  152: { name: 'hv_battery_charge_level',   unit: '%' },
  168: { name: 'battery_voltage_2',         unit: 'V', scale: 0.001 },
  // FMC150 CAN
  388:  { name: 'can_module_id',           unit: 'raw' },
  // FMC650 alternate IDs
  144:  { name: 'sd_status',               unit: 'bool' },
  10009: { name: 'eco_score',              unit: 'raw', scale: 0.01 },
  // Tachograph data elements (FMC650/FMM650/FMX6XX)
  183: { name: 'drive_recognize',          unit: 'raw' },
  184: { name: 'driver1_working_state',    unit: 'enum', values: { 0: 'rest', 1: 'driver_available', 2: 'work', 3: 'drive', 6: 'error', 7: 'not_available' } },
  186: { name: 'tachograph_overspeed',     unit: 'raw' },
  187: { name: 'driver1_card_presence',    unit: 'enum', values: { 0: 'not_present', 1: 'present', 2: 'error', 3: 'not_available' } },
  189: { name: 'driver1_time_related_state', unit: 'enum', values: {
    0: 'normal', 1: 'pre_warning_4h30', 2: '4h30_reached', 3: 'pre_warning_9h', 4: '9h_reached',
    5: 'pre_warning_16h', 6: '16h_reached', 7: 'weekly_pre_warning', 8: 'weekly_warning',
    9: 'two_weekly_pre_warning', 10: 'two_weekly_warning', 11: 'driver1_card_expiry_warning',
    12: 'driver1_card_download_warning', 13: 'other', 14: 'error', 15: 'not_available',
  } },
  233: { name: 'vin_part_1',               unit: 'ascii8' },
  234: { name: 'vin_part_2',               unit: 'ascii8' },
  235: { name: 'vin_part_3',               unit: 'ascii1' },
  // Bulk import: Full AVL ID list for FMC650, auto-generated from Teltonika wiki
  // (archive.org snapshot 2026-01-17). Best-effort name/unit parsing, not hand-verified.
  7: { name: 'dallas_temperature_id_6', unit: 'raw' }, // Dallas Temperature ID 6
  8: { name: 'dallas_temperature_6', unit: 'raw' }, // Dallas Temperature 6
  90: { name: 'axle_weight_2', unit: 'kg' }, // Axle weight 2
  100: { name: 'axle_weight_12', unit: 'kg' }, // Axle weight 12
  101: { name: 'axle_weight_13', unit: 'kg' }, // Axle weight 13
  109: { name: 'software_version_supported', unit: 'raw' }, // Software Version Supported
  110: { name: 'diagnostics_supported', unit: 'enum', values: { 0: 'diagnostics_is_not_supported', 1: 'diagnostics_is_supported', 2: 'reserved', 3: 'do_not_care' } }, // Diagnostics Supported
  111: { name: 'requests_supported', unit: 'enum', values: { 0: 'request_is_not_supported', 1: 'request_is_supported', 2: 'reserved', 3: 'do_not_care' } }, // Requests Supported
  127: { name: 'engine_coolant_temperature', unit: '°C' }, // Engine Coolant Temperature
  128: { name: 'ambient_air_temperature', unit: '°C' }, // Ambient Air Temperature
  135: { name: 'fuel_rate', unit: 'l/h' }, // Fuel Rate
  136: { name: 'instantaneous_fuel_economy', unit: 'km/l' }, // Instantaneous Fuel Economy
  137: { name: 'pto_drive_engagement', unit: 'enum', values: { 0: 'no_pto_drive_is_engaged', 1: 'at_least_one_pto_drive_is_engaged', 2: 'error', 3: 'not_available' } }, // PTO Drive Engagement
  138: { name: 'high_resolution_engine_total_fuel_used', unit: 'l or ml' }, // High Resolution Engine Total Fuel Used
  139: { name: 'gross_combination_vehicle_weight', unit: 'kg' }, // Gross Combination Vehicle Weight
  141: { name: 'battery_temperature', unit: '°C', scale: 0.1 }, // Battery Temperature
  142: { name: 'battery_level_percent', unit: '%' }, // Battery Level Percent
  143: { name: 'door_status', unit: 'raw' }, // Door Status
  145: { name: 'manual_can_00', unit: 'raw' }, // Manual CAN 00
  146: { name: 'manual_can_01', unit: 'raw' }, // Manual CAN 01
  147: { name: 'manual_can_02', unit: 'raw' }, // Manual CAN 02
  148: { name: 'manual_can_03', unit: 'raw' }, // Manual CAN 03
  149: { name: 'manual_can_04', unit: 'raw' }, // Manual CAN 04
  150: { name: 'manual_can_05', unit: 'raw' }, // Manual CAN 05
  151: { name: 'manual_can_06', unit: 'raw' }, // Manual CAN 06
  160: { name: 'geofence_zone_06_160', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 06
  161: { name: 'geofence_zone_07_161', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 07
  162: { name: 'geofence_zone_08_162', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 08
  163: { name: 'geofence_zone_09_163', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 09
  164: { name: 'geofence_zone_10_164', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 10
  165: { name: 'geofence_zone_11_165', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 11
  166: { name: 'geofence_zone_12_166', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 12
  167: { name: 'geofence_zone_13_167', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 13
  169: { name: 'geofence_zone_15_169', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 15
  170: { name: 'geofence_zone_16_170', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 16
  171: { name: 'geofence_zone_17_171', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 17
  172: { name: 'geofence_zone_18_172', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 18
  173: { name: 'geofence_zone_19_173', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 19
  174: { name: 'geofence_zone_20_174', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 20
  176: { name: 'dtc_errors', unit: 'raw' }, // DTC Errors
  177: { name: 'event_reserved01', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Event Reserved01
  185: { name: 'driver_2_working_state', unit: 'enum', values: { 1: 'driver_available', 7: 'not_available' } }, // Driver 2 Working State
  232: { name: 'vehicle_registration_number_part2', unit: 'ascii8' }, // FMS kenteken deel 2
  242: { name: 'data_limit_hit', unit: 'raw' }, // Data Limit Hit
  244: { name: 'camera_image_generated', unit: 'raw' }, // Camera Image Generated
  245: { name: 'analog_input_4', unit: 'V', scale: 0.001 }, // Analog Input 4
  288: { name: 'me_sound_type', unit: 'raw' }, // ME Sound Type
  289: { name: 'me_pedestrians_in_danger_zone', unit: 'raw' }, // ME Pedestrians in Danger Zone
  290: { name: 'me_pedestrians_in_forward_collision_warning', unit: 'raw' }, // ME Pedestrians in Forward Collision Warning
  291: { name: 'me_time_indicator', unit: 'raw' }, // ME Time Indicator
  292: { name: 'me_error_valid', unit: 'raw' }, // ME Error Valid
  293: { name: 'me_error_code', unit: 'raw' }, // ME Error Code
  294: { name: 'me_zero_speed', unit: 'raw' }, // ME Zero Speed
  295: { name: 'me_headway_valid', unit: 'raw' }, // ME Headway Valid
  296: { name: 'me_headway_measurement', unit: 'raw' }, // ME Headway Measurement
  297: { name: 'me_ldw_off', unit: 'raw' }, // ME LDW Off
  298: { name: 'me_left_ldw_on', unit: 'raw' }, // ME Left LDW On
  299: { name: 'me_right_ldw_on', unit: 'raw' }, // ME Right LDW On
  300: { name: 'me_maintenance', unit: 'raw' }, // ME Maintenance
  301: { name: 'me_fail_safe', unit: 'raw' }, // ME Fail Safe
  302: { name: 'me_fcw_on', unit: 'raw' }, // ME FCW On
  304: { name: 'me_headway_warning_repeat_enabled', unit: 'raw' }, // ME Headway Warning Repeat Enabled
  305: { name: 'me_headway_warning_level', unit: 'raw' }, // ME Headway Warning Level
  310: { name: 'me_wipers', unit: 'raw' }, // ME Wipers
  311: { name: 'me_right_signal', unit: 'raw' }, // ME Right Signal
  312: { name: 'me_left_signal', unit: 'raw' }, // ME Left Signal
  313: { name: 'me_brake_signal', unit: 'raw' }, // ME Brake Signal
  314: { name: 'me_wipers_available', unit: 'raw' }, // ME Wipers Available
  315: { name: 'me_low_beam_available', unit: 'raw' }, // ME Low Beam Available
  316: { name: 'me_high_beam_available', unit: 'raw' }, // ME High Beam Available
  318: { name: 'me_speed', unit: 'km/h' }, // ME Speed
  319: { name: 'me_tsr_1', unit: 'raw' }, // ME TSR 1
  320: { name: 'me_tsr_2', unit: 'raw' }, // ME TSR 2
  321: { name: 'me_tsr_3', unit: 'raw' }, // ME TSR 3
  322: { name: 'me_tsr_4', unit: 'raw' }, // ME TSR 4
  323: { name: 'me_tsr_5', unit: 'raw' }, // ME TSR 5
  324: { name: 'me_tsr_6', unit: 'raw' }, // ME TSR 6
  326: { name: 'me_tsr_vo', unit: 'raw' }, // ME TSR VO
  328: { name: 'geofence_zone_22_328', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 22
  330: { name: 'geofence_zone_24_330', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 24
  331: { name: 'geofence_zone_25_331', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 25
  332: { name: 'geofence_zone_26_332', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 26
  333: { name: 'geofence_zone_27_333', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 27
  334: { name: 'geofence_zone_28_334', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 28
  339: { name: 'geofence_zone_33_339', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 33
  340: { name: 'geofence_zone_34_340', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 34
  341: { name: 'geofence_zone_35_341', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 35
  342: { name: 'geofence_zone_36_342', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 36
  343: { name: 'geofence_zone_37_343', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 37
  344: { name: 'geofence_zone_38_344', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 38
  345: { name: 'geofence_zone_39_345', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 39
  346: { name: 'geofence_zone_40_346', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 40
  347: { name: 'geofence_zone_41_347', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 41
  348: { name: 'geofence_zone_42_348', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 42
  349: { name: 'geofence_zone_43_349', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 43
  350: { name: 'geofence_zone_44_350', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 44
  351: { name: 'geofence_zone_45_351', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 45
  352: { name: 'geofence_zone_46_352', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 46
  353: { name: 'geofence_zone_47_353', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 47
  354: { name: 'geofence_zone_48_354', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 48
  355: { name: 'geofence_zone_49_355', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 49
  356: { name: 'geofence_zone_50_356', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 50
  357: { name: 'brake_pedal_position', unit: '%' }, // Brake Pedal Position
  358: { name: 'custom_scenario_1', unit: 'raw' }, // Custom Scenario 1
  359: { name: 'custom_scenario_2', unit: 'raw' }, // Custom Scenario 2
  360: { name: 'custom_scenario_3', unit: 'raw' }, // Custom Scenario 3
  361: { name: 'custom_scenario_4', unit: 'raw' }, // Custom Scenario 4
  382: { name: 'manual_can_12', unit: 'raw' }, // Manual CAN 12
  383: { name: 'manual_can_13', unit: 'raw' }, // Manual CAN 13
  384: { name: 'manual_can_14', unit: 'raw' }, // Manual CAN 14
  386: { name: 'manual_can_16', unit: 'raw' }, // Manual CAN 16
  389: { name: 'manual_can_19', unit: 'raw' }, // Manual CAN 19
  484: { name: 'external_sensor_temperature_1', unit: '°C' }, // External Sensor Temperature 1
  485: { name: 'external_sensor_temperature_2', unit: '°C' }, // External Sensor Temperature 2
  486: { name: 'external_sensor_temperature_3', unit: '°C' }, // External Sensor Temperature 3
  487: { name: 'external_sensor_temperature_4', unit: '°C' }, // External Sensor Temperature 4
  488: { name: 'external_sensor_temperature_5', unit: '°C' }, // External Sensor Temperature 5
  489: { name: 'external_sensor_temperature_6', unit: '°C' }, // External Sensor Temperature 6
  503: { name: 'horizontal_distance_arm', unit: 'm' }, // Horizontal Distance Arm
  504: { name: 'height_arm_above_ground', unit: 'm' }, // Height Arm Above Ground
  505: { name: 'drill_rpm', unit: 'rpm' }, // Drill RPM
  506: { name: 'spread_salt', unit: 'g/m2' }, // Spread Salt
  507: { name: 'battery_voltage_507', unit: 'V' }, // Battery Voltage
  508: { name: 'spread_fine_grained_salt', unit: 'T' }, // Spread Fine Grained Salt
  509: { name: 'coarse_grained_salt', unit: 'T' }, // Coarse Grained Salt
  510: { name: 'spread_dimix', unit: 'T' }, // Spread DiMix
  511: { name: 'spread_coarse_grained_calcium', unit: 'm2' }, // Spread Coarse Grained Calcium
  512: { name: 'spread_calcium_chloride', unit: 'm2' }, // Spread Calcium Chloride
  513: { name: 'spread_sodium_chloride', unit: 'm2' }, // Spread Sodium Chloride
  514: { name: 'spread_magnesium_chloride_m2', unit: 'm2' }, // Spread Magnesium Chloride, m2
  515: { name: 'amount_of_spread_gravel', unit: 'T' }, // Amount Of Spread Gravel
  516: { name: 'amount_of_spread_sand', unit: 'T' }, // Amount Of Spread Sand
  517: { name: 'width_pouring_left', unit: 'm' }, // Width Pouring Left
  518: { name: 'width_pouring_right', unit: 'm' }, // Width Pouring Right
  519: { name: 'salt_spreader_working_hours', unit: 'h' }, // Salt Spreader Working Hours
  520: { name: 'distance_during_salting', unit: 'km' }, // Distance During Salting
  521: { name: 'load_weight', unit: 'kg' }, // Load Weight
  522: { name: 'retarder_load', unit: '%' }, // Retarder Load
  523: { name: 'cruise_time', unit: 'min' }, // Cruise Time
  524: { name: 'engine_oil_level_524', unit: 'raw' }, // Engine Oil Level
  525: { name: 'fault_codes_525', unit: 'raw' }, // Fault Codes
  526: { name: 'vehicles_range_on_battery', unit: 'm' }, // Vehicles Range On Battery
  527: { name: 'vehicles_range_on_additional_fuel', unit: 'm' }, // Vehicles Range On Additional Fuel
  528: { name: 'vin_528', unit: 'raw' }, // VIN
  529: { name: 'module_id_17b', unit: 'raw' }, // Module ID 17B
  548: { name: 'advanced_ble_advertisement_data', unit: 'raw' }, // Advanced BLE Advertisement data
  550: { name: 'geofence_zone_51', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 51
  551: { name: 'geofence_zone_52', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 52
  552: { name: 'geofence_zone_53', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 53
  553: { name: 'geofence_zone_54', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 54
  554: { name: 'geofence_zone_55', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 55
  555: { name: 'geofence_zone_56', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 56
  556: { name: 'geofence_zone_57', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 57
  557: { name: 'geofence_zone_58', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 58
  558: { name: 'geofence_zone_59', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 59
  559: { name: 'geofence_zone_60', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 60
  560: { name: 'geofence_zone_61', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 61
  561: { name: 'geofence_zone_62', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 62
  562: { name: 'geofence_zone_63', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 63
  563: { name: 'geofence_zone_64', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 64
  564: { name: 'geofence_zone_65', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 65
  565: { name: 'geofence_zone_66', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 66
  566: { name: 'geofence_zone_67', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 67
  567: { name: 'geofence_zone_68', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 68
  568: { name: 'geofence_zone_69', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 69
  569: { name: 'geofence_zone_70', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 70
  570: { name: 'geofence_zone_71', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 71
  571: { name: 'geofence_zone_72', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 72
  572: { name: 'geofence_zone_73', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 73
  573: { name: 'geofence_zone_74', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 74
  574: { name: 'geofence_zone_75', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 75
  575: { name: 'geofence_zone_76', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 76
  576: { name: 'geofence_zone_77', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 77
  577: { name: 'geofence_zone_78', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 78
  578: { name: 'geofence_zone_79', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 79
  579: { name: 'geofence_zone_80', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 80
  580: { name: 'geofence_zone_81', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 81
  581: { name: 'geofence_zone_82', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 82
  582: { name: 'geofence_zone_83', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 83
  583: { name: 'geofence_zone_84', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 84
  584: { name: 'geofence_zone_85', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 85
  585: { name: 'geofence_zone_86', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 86
  586: { name: 'geofence_zone_87', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 87
  587: { name: 'geofence_zone_88', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 88
  588: { name: 'geofence_zone_89', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 89
  589: { name: 'geofence_zone_90', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 90
  590: { name: 'geofence_zone_91', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 91
  591: { name: 'geofence_zone_92', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 92
  592: { name: 'geofence_zone_93', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 93
  593: { name: 'geofence_zone_94', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 94
  594: { name: 'geofence_zone_95', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 95
  595: { name: 'geofence_zone_96', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 96
  596: { name: 'geofence_zone_97', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 97
  597: { name: 'geofence_zone_98', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 98
  598: { name: 'geofence_zone_99', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 99
  599: { name: 'geofence_zone_100', unit: 'enum', values: { 0: 'target_left_zone', 1: 'target_entered_zone' } }, // Geofence zone 100
  701: { name: 'ble_temperature_1_701', unit: 'raw' }, // BLE Temperature 1
  702: { name: 'ble_temperature_2_702', unit: 'raw' }, // BLE Temperature 2
  703: { name: 'ble_temperature_3_703', unit: 'raw' }, // BLE Temperature 3
  704: { name: 'ble_temperature_4_704', unit: 'raw' }, // BLE Temperature 4
  705: { name: 'ble_battery_1_705', unit: '%' }, // BLE Battery 1
  706: { name: 'ble_battery_2_706', unit: '%' }, // BLE Battery 2
  707: { name: 'ble_battery_3_707', unit: '%' }, // BLE Battery 3
  708: { name: 'ble_battery_4_708', unit: '%' }, // BLE Battery 4
  709: { name: 'ble_humidity_1_709', unit: '%RH' }, // BLE Humidity 1
  710: { name: 'ble_humidity_2_710', unit: '%RH' }, // BLE Humidity 2
  711: { name: 'ble_humidity_3_711', unit: '%RH' }, // BLE Humidity 3
  712: { name: 'ble_humidity_4_712', unit: '%RH' }, // BLE Humidity 4
  713: { name: 'ble_sensor_custom_1', unit: 'raw' }, // BLE Sensor Custom 1
  714: { name: 'ble_sensor_custom_2', unit: 'raw' }, // BLE Sensor Custom 2
  715: { name: 'ble_sensor_custom_3', unit: 'raw' }, // BLE Sensor Custom 3
  716: { name: 'ble_sensor_custom_4', unit: 'raw' }, // BLE Sensor Custom 4
  717: { name: 'ble_illum1', unit: 'raw' }, // BLE Illum1
  718: { name: 'ble_illum2', unit: 'raw' }, // BLE Illum2
  719: { name: 'ble_illum3', unit: 'raw' }, // BLE Illum3
  720: { name: 'ble_illum4', unit: 'raw' }, // BLE Illum4
  721: { name: 'ble_lls_fuel_1', unit: 'raw' }, // BLE LLS Fuel 1
  722: { name: 'ble_lls_fuel_2', unit: 'raw' }, // BLE LLS Fuel 2
  723: { name: 'ble_lls_fuel_3', unit: 'raw' }, // BLE LLS Fuel 3
  724: { name: 'ble_lls_fuel_4', unit: 'raw' }, // BLE LLS Fuel 4
  725: { name: 'ble_freq_1', unit: 'raw' }, // BLE Freq 1
  726: { name: 'ble_freq_2', unit: 'raw' }, // BLE Freq 2
  727: { name: 'ble_freq_3', unit: 'raw' }, // BLE Freq 3
  728: { name: 'ble_freq_4', unit: 'raw' }, // BLE Freq 4
  729: { name: 'ble_sensor_custom_12', unit: 'raw' }, // BLE Sensor Custom 12
  730: { name: 'ble_sensor_custom_13', unit: 'raw' }, // BLE Sensor Custom 13
  731: { name: 'ble_sensor_custom_14', unit: 'raw' }, // BLE Sensor Custom 14
  732: { name: 'ble_sensor_custom_15', unit: 'raw' }, // BLE Sensor Custom 15
  733: { name: 'ble_sensor_custom_22', unit: 'raw' }, // BLE Sensor Custom 22
  734: { name: 'ble_sensor_custom_23', unit: 'raw' }, // BLE Sensor Custom 23
  735: { name: 'ble_sensor_custom_24', unit: 'raw' }, // BLE Sensor Custom 24
  736: { name: 'ble_sensor_custom_25', unit: 'raw' }, // BLE Sensor Custom 25
  737: { name: 'ble_sensor_custom_32', unit: 'raw' }, // BLE Sensor Custom 32
  738: { name: 'ble_sensor_custom_33', unit: 'raw' }, // BLE Sensor Custom 33
  739: { name: 'ble_sensor_custom_34', unit: 'raw' }, // BLE Sensor Custom 34
  740: { name: 'ble_sensor_custom_35', unit: 'raw' }, // BLE Sensor Custom 35
  741: { name: 'ble_sensor_custom_42', unit: 'raw' }, // BLE Sensor Custom 42
  742: { name: 'ble_sensor_custom_43', unit: 'raw' }, // BLE Sensor Custom 43
  743: { name: 'ble_sensor_custom_44', unit: 'raw' }, // BLE Sensor Custom 44
  744: { name: 'ble_sensor_custom_45', unit: 'raw' }, // BLE Sensor Custom 45
  10045: { name: 'zone_1_compartment_state', unit: 'raw' }, // Zone 1 Compartment state
  10046: { name: 'zone_1_compartment_mode', unit: 'raw' }, // Zone 1 Compartment mode
  10047: { name: 'zone_1_return_air_sensor_1', unit: '°C', scale: 0.1 }, // Zone 1 Return Air Sensor 1
  10048: { name: 'zone_1_supply_air_sensor_1', unit: '°C', scale: 0.1 }, // Zone 1 Supply Air Sensor 1
  10049: { name: 'zone_1_set_temperature', unit: '°C', scale: 0.1 }, // Zone 1 Set Temperature
  10050: { name: 'zone_1_evaporator_temperature', unit: '°C', scale: 0.1 }, // Zone 1 Evaporator temperature
  10051: { name: 'zone_1_return_air_sensor_2', unit: '°C', scale: 0.1 }, // Zone 1 Return Air Sensor 2
  10052: { name: 'zone_1_supply_air_sensor_2', unit: '°C', scale: 0.1 }, // Zone 1 Supply Air Sensor 2
  10056: { name: 'zone_2_return_air_sensor_1', unit: '°C', scale: 0.1 }, // Zone 2 Return Air Sensor 1
  10057: { name: 'zone_2_supply_air_sensor_1', unit: '°C', scale: 0.1 }, // Zone 2 Supply Air Sensor 1
  10058: { name: 'zone_2_set_temperature', unit: '°C', scale: 0.1 }, // Zone 2 Set Temperature
  10059: { name: 'zone_2_evaporator_temperature', unit: '°C', scale: 0.1 }, // Zone 2 Evaporator temperature
  10060: { name: 'zone_2_return_air_sensor_2', unit: '°C', scale: 0.1 }, // Zone 2 Return Air sensor 2
  10061: { name: 'zone_2_supply_air_sensor_2', unit: '°C', scale: 0.1 }, // Zone 2 Supply Air sensor 2
  10063: { name: 'zone_3_compartment_state', unit: 'raw' }, // Zone 3 Compartment state
  10064: { name: 'zone_3_compartment_mode', unit: 'raw' }, // Zone 3 Compartment mode
  10065: { name: 'zone_3_return_air_sensor_1', unit: '°C', scale: 0.1 }, // Zone 3 Return Air sensor 1
  10066: { name: 'zone_3_supply_air_sensor_1', unit: '°C', scale: 0.1 }, // Zone 3 Supply Air sensor 1
  10067: { name: 'zone_3_set_temperature', unit: '°C', scale: 0.1 }, // Zone 3 Set Temperature
  10068: { name: 'zone_3_evaporator_temperature', unit: '°C', scale: 0.1 }, // Zone 3 Evaporator temperature
  10069: { name: 'zone_3_return_air_sensor_2', unit: '°C', scale: 0.1 }, // Zone 3 Return Air sensor 2
  10070: { name: 'zone_3_supply_air_sensor_2', unit: '°C', scale: 0.1 }, // Zone 3 Supply Air sensor 2
  10071: { name: 'zone_3_operating_mode', unit: 'raw' }, // Zone 3 Operating Mode
  10189: { name: 'total_tires', unit: 'raw' }, // Total Tires
  10190: { name: 'total_axles', unit: 'raw' }, // Total Axles
  10191: { name: 'graphical_position', unit: 'raw' }, // Graphical Position
  10192: { name: 'tire_1_pressure', unit: 'raw' }, // Tire 1 pressure
  10193: { name: 'tire_2_pressure', unit: 'raw' }, // Tire 2 pressure
  10194: { name: 'tire_3_pressure', unit: 'raw' }, // Tire 3 pressure
  10195: { name: 'tire_4_pressure', unit: 'raw' }, // Tire 4 pressure
  10196: { name: 'tire_5_pressure', unit: 'raw' }, // Tire 5 pressure
  10197: { name: 'tire_6_pressure', unit: 'raw' }, // Tire 6 pressure
  10198: { name: 'tire_7_pressure', unit: 'raw' }, // Tire 7 pressure
  10199: { name: 'tire_8_pressure', unit: 'raw' }, // Tire 8 pressure
  10200: { name: 'tire_9_pressure', unit: 'raw' }, // Tire 9 pressure
  10201: { name: 'tire_10_pressure', unit: 'raw' }, // Tire 10 pressure
  10202: { name: 'tire_11_pressure', unit: 'raw' }, // Tire 11 pressure
  10203: { name: 'tire_12_pressure', unit: 'raw' }, // Tire 12 pressure
  10204: { name: 'tire_13_pressure', unit: 'raw' }, // Tire 13 pressure
  10205: { name: 'tire_14_pressure', unit: 'raw' }, // Tire 14 pressure
  10206: { name: 'tire_15_pressure', unit: 'raw' }, // Tire 15 pressure
  10207: { name: 'tire_16_pressure', unit: 'raw' }, // Tire 16 pressure
  10208: { name: 'tire_17_pressure', unit: 'raw' }, // Tire 17 pressure
  10209: { name: 'tire_18_pressure', unit: 'raw' }, // Tire 18 pressure
  10210: { name: 'tire_19_pressure', unit: 'raw' }, // Tire 19 pressure
  10211: { name: 'tire_20_pressure', unit: 'raw' }, // Tire 20 pressure
  10212: { name: 'tire_21_pressure', unit: 'raw' }, // Tire 21 pressure
  10213: { name: 'tire_22_pressure', unit: 'raw' }, // Tire 22 pressure
  10214: { name: 'tire_23_pressure', unit: 'raw' }, // Tire 23 pressure
  10215: { name: 'tire_24_pressure', unit: 'raw' }, // Tire 24 pressure
  10298: { name: 'manual_can_20', unit: 'raw' }, // Manual CAN 20
  10299: { name: 'manual_can_21', unit: 'raw' }, // Manual CAN 21
  10300: { name: 'manual_can_22', unit: 'raw' }, // Manual CAN 22
  10301: { name: 'manual_can_23', unit: 'raw' }, // Manual CAN 23
  10302: { name: 'manual_can_24', unit: 'raw' }, // Manual CAN 24
  10303: { name: 'manual_can_25', unit: 'raw' }, // Manual CAN 25
  10304: { name: 'manual_can_26', unit: 'raw' }, // Manual CAN 26
  10305: { name: 'manual_can_27', unit: 'raw' }, // Manual CAN 27
  10306: { name: 'manual_can_28', unit: 'raw' }, // Manual CAN 28
  10307: { name: 'manual_can_29', unit: 'raw' }, // Manual CAN 29
  10308: { name: 'manual_can_30', unit: 'raw' }, // Manual CAN 30
  10309: { name: 'manual_can_31', unit: 'raw' }, // Manual CAN 31
  10310: { name: 'manual_can_32', unit: 'raw' }, // Manual CAN 32
  10311: { name: 'manual_can_33', unit: 'raw' }, // Manual CAN 33
  10312: { name: 'manual_can_34', unit: 'raw' }, // Manual CAN 34
  10313: { name: 'manual_can_35', unit: 'raw' }, // Manual CAN 35
  10314: { name: 'manual_can_36', unit: 'raw' }, // Manual CAN 36
  10315: { name: 'manual_can_37', unit: 'raw' }, // Manual CAN 37
  10316: { name: 'manual_can_38', unit: 'raw' }, // Manual CAN 38
  10317: { name: 'manual_can_39', unit: 'raw' }, // Manual CAN 39
  10318: { name: 'manual_can_40', unit: 'raw' }, // Manual CAN 40
  10319: { name: 'manual_can_41', unit: 'raw' }, // Manual CAN 41
  10320: { name: 'manual_can_42', unit: 'raw' }, // Manual CAN 42
  10321: { name: 'manual_can_43', unit: 'raw' }, // Manual CAN 43
  10322: { name: 'manual_can_44', unit: 'raw' }, // Manual CAN 44
  10323: { name: 'manual_can_45', unit: 'raw' }, // Manual CAN 45
  10324: { name: 'manual_can_46', unit: 'raw' }, // Manual CAN 46
  10325: { name: 'manual_can_47', unit: 'raw' }, // Manual CAN 47
  10326: { name: 'manual_can_48', unit: 'raw' }, // Manual CAN 48
  10327: { name: 'manual_can_49', unit: 'raw' }, // Manual CAN 49
  10328: { name: 'manual_can_50', unit: 'raw' }, // Manual CAN 50
  10329: { name: 'manual_can_51', unit: 'raw' }, // Manual CAN 51
  10330: { name: 'manual_can_52', unit: 'raw' }, // Manual CAN 52
  10331: { name: 'manual_can_53', unit: 'raw' }, // Manual CAN 53
  10332: { name: 'manual_can_54', unit: 'raw' }, // Manual CAN 54
  10333: { name: 'manual_can_55', unit: 'raw' }, // Manual CAN 55
  10334: { name: 'manual_can_56', unit: 'raw' }, // Manual CAN 56
  10335: { name: 'manual_can_57', unit: 'raw' }, // Manual CAN 57
  10336: { name: 'manual_can_58', unit: 'raw' }, // Manual CAN 58
  10337: { name: 'manual_can_59', unit: 'raw' }, // Manual CAN 59
  10338: { name: 'manual_can_60', unit: 'raw' }, // Manual CAN 60
  10339: { name: 'manual_can_61', unit: 'raw' }, // Manual CAN 61
  10340: { name: 'manual_can_62', unit: 'raw' }, // Manual CAN 62
  10341: { name: 'manual_can_63', unit: 'raw' }, // Manual CAN 63
  10342: { name: 'manual_can_64', unit: 'raw' }, // Manual CAN 64
  10343: { name: 'manual_can_65', unit: 'raw' }, // Manual CAN 65
  10344: { name: 'manual_can_66', unit: 'raw' }, // Manual CAN 66
  10345: { name: 'manual_can_67', unit: 'raw' }, // Manual CAN 67
  10346: { name: 'manual_can_68', unit: 'raw' }, // Manual CAN 68
  10347: { name: 'manual_can_69', unit: 'raw' }, // Manual CAN 69
  10348: { name: 'fuel_level_2', unit: '%' }, // Fuel level 2
  10349: { name: 'mil_indicator', unit: 'enum', values: { 0: 'off', 1: 'condition_red', 2: 'condition_yellow', 3: 'condition_info', 7: 'not_available_there_are_three_possible_conditions_stated_red_yellow_info_the_interpretation_of_the_status_is_manufacturer_dependant_and_might_be_different_for_details_please_refer_to_the_manufacturer_s_document' } }, // MIL indicator
  10350: { name: 'ambient_air_temperature_10350', unit: '°C', scale: 0.1 }, // Ambient Air Temperature
  10351: { name: 'compressor_coolant_temperature', unit: '°C', scale: 0.1 }, // Compressor Coolant Temperature
  10353: { name: 'compressor_rpm', unit: 'raw' }, // Compressor RPM
  10354: { name: 'compressor_config', unit: 'raw' }, // Compressor Config
  10356: { name: 'installation_serial', unit: 'String' }, // Installation Serial
  10360: { name: 'tire_1_temperature', unit: '°C' }, // Tire 1 Temperature
  10361: { name: 'tire_1_warning', unit: 'raw' }, // Tire 1 Warning
  10362: { name: 'tire_2_temperature', unit: '°C' }, // Tire 2 Temperature
  10363: { name: 'tire_2_warning', unit: 'raw' }, // Tire 2 Warning
  10364: { name: 'tire_3_temperature', unit: '°C' }, // Tire 3 Temperature
  10365: { name: 'tire_3_warning', unit: 'raw' }, // Tire 3 Warning
  10366: { name: 'tire_4_temperature', unit: '°C' }, // Tire 4 Temperature
  10367: { name: 'tire_4_warning', unit: 'raw' }, // Tire 4 Warning
  10368: { name: 'tire_5_temperature', unit: '°C' }, // Tire 5 Temperature
  10369: { name: 'tire_5_warning', unit: 'raw' }, // Tire 5 Warning
  10370: { name: 'tire_6_temperature', unit: '°C' }, // Tire 6 Temperature
  10371: { name: 'tire_6_warning', unit: 'raw' }, // Tire 6 Warning
  10372: { name: 'tire_7_temperature', unit: '°C' }, // Tire 7 Temperature
  10373: { name: 'tire_7_warning', unit: 'raw' }, // Tire 7 Warning
  10374: { name: 'tire_8_temperature', unit: '°C' }, // Tire 8 Temperature
  10375: { name: 'tire_8_warning', unit: 'raw' }, // Tire 8 Warning
  10376: { name: 'tire_9_temperature', unit: '°C' }, // Tire 9 Temperature
  10377: { name: 'tire_9_warning', unit: 'raw' }, // Tire 9 Warning
  10378: { name: 'tire_10_temperature', unit: '°C' }, // Tire 10 Temperature
  10379: { name: 'tire_10_warning', unit: 'raw' }, // Tire 10 Warning
  10380: { name: 'tire_11_temperature', unit: '°C' }, // Tire 11 Temperature
  10381: { name: 'tire_11_warning', unit: 'raw' }, // Tire 11 Warning
  10382: { name: 'tire_12_temperature', unit: '°C' }, // Tire 12 Temperature
  10383: { name: 'tire_12_warning', unit: 'raw' }, // Tire 12 Warning
  10384: { name: 'tire_13_temperature', unit: '°C' }, // Tire 13 Temperature
  10385: { name: 'tire_13_warning', unit: 'raw' }, // Tire 13 Warning
  10386: { name: 'tire_14_temperature', unit: '°C' }, // Tire 14 Temperature
  10387: { name: 'tire_14_warning', unit: 'raw' }, // Tire 14 Warning
  10388: { name: 'tire_15_temperature', unit: '°C' }, // Tire 15 Temperature
  10389: { name: 'tire_15_warning', unit: 'raw' }, // Tire 15 Warning
  10390: { name: 'tire_16_temperature', unit: '°C' }, // Tire 16 Temperature
  10391: { name: 'tire_16_warning', unit: 'raw' }, // Tire 16 Warning
  10392: { name: 'tire_17_temperature', unit: '°C' }, // Tire 17 Temperature
  10393: { name: 'tire_17_warning', unit: 'raw' }, // Tire 17 Warning
  10394: { name: 'tire_18_temperature', unit: '°C' }, // Tire 18 Temperature
  10395: { name: 'tire_18_warning', unit: 'raw' }, // Tire 18 Warning
  10396: { name: 'tire_19_temperature', unit: '°C' }, // Tire 19 Temperature
  10397: { name: 'tire_19_warning', unit: 'raw' }, // Tire 19 Warning
  10398: { name: 'tire_20_temperature', unit: '°C' }, // Tire 20 Temperature
  10399: { name: 'tire_20_warning', unit: 'raw' }, // Tire 20 Warning
  10400: { name: 'tire_21_temperature', unit: '°C' }, // Tire 21 Temperature
  10401: { name: 'tire_21_warning', unit: 'raw' }, // Tire 21 Warning
  10402: { name: 'tire_22_temperature', unit: '°C' }, // Tire 22 Temperature
  10403: { name: 'tire_22_warning', unit: 'raw' }, // Tire 22 Warning
  10404: { name: 'tire_23_temperature', unit: '°C' }, // Tire 23 Temperature
  10405: { name: 'tire_23_warning', unit: 'raw' }, // Tire 23 Warning
  10406: { name: 'tire_24_temperature', unit: '°C' }, // Tire 24 Temperature
  10407: { name: 'tire_24_warning', unit: 'raw' }, // Tire 24 Warning
  10428: { name: 'tell_tale_0', unit: 'raw' }, // Tell Tale 0
  10429: { name: 'tell_tale_1', unit: 'raw' }, // Tell Tale 1
  10430: { name: 'tell_tale_2', unit: 'raw' }, // Tell Tale 2
  10431: { name: 'tell_tale_3', unit: 'raw' }, // Tell Tale 3
  10455: { name: 'adblue_level', unit: '%' }, // AdBlue level
  10456: { name: 'ferrytrainstatus', unit: 'raw' }, // FerryTrainStatus
  10464: { name: 'external_digital_sensor_1', unit: 'raw' }, // External Digital Sensor 1
  10465: { name: 'external_digital_sensor_2', unit: 'raw' }, // External Digital Sensor 2
  10466: { name: 'external_digital_sensor_3', unit: 'raw' }, // External Digital Sensor 3
  10467: { name: 'external_digital_sensor_4', unit: 'raw' }, // External Digital Sensor 4
  10468: { name: 'analog_input_1_10468', unit: 'V' }, // Analog Input 1
  10469: { name: 'analog_input_2_10469', unit: 'V' }, // Analog Input 2
  10470: { name: 'analog_input_3', unit: 'V' }, // Analog Input 3
  10472: { name: 'manufacturer_id', unit: 'raw' }, // Manufacturer ID
  10473: { name: 'battery_state_flags', unit: 'enum', values: { 0: 'awailable_bit', 1: 'error_bit', 2: 'alarm_bit', 3: 'digitalsensor' } }, // Battery State Flags
  10474: { name: 'fuel_state_flags', unit: 'enum', values: { 0: 'awailable_bit', 1: 'error_bit', 2: 'alarm_bit', 3: 'digitalsensor' } }, // Fuel state flags
  10475: { name: 'maintenance_1_hours', unit: 'h' }, // Maintenance 1 Hours
  10476: { name: 'maintenance_2_hours', unit: 'h' }, // Maintenance 2 Hours
  10477: { name: 'maintenance_3_hours', unit: 'h' }, // Maintenance 3 Hours
  10478: { name: 'maintenance_4_hours', unit: 'h' }, // Maintenance 4 Hours
  10479: { name: 'maintenance_5_hours', unit: 'h' }, // Maintenance 5 Hours
  10480: { name: 'run_mode', unit: 'raw' }, // Run Mode
  10487: { name: '1wire_humidity_1', unit: '%' }, // 1Wire Humidity 1
  10488: { name: '1wire_humidity_2', unit: '%' }, // 1Wire Humidity 2
  10489: { name: '1wire_humidity_3', unit: '%' }, // 1Wire Humidity 3
  10490: { name: '1wire_humidity_4', unit: '%' }, // 1Wire Humidity 4
  10491: { name: '1wire_humidity_5', unit: '%' }, // 1Wire Humidity 5
  10492: { name: '1wire_humidity_6', unit: '%' }, // 1Wire Humidity 6
  10500: { name: 'ble_advertisement_data', unit: 'raw' }, // BLE Advertisement data
  10501: { name: 'drivers_hours_rules_pre_warning_time_delay', unit: 'Minutes' }, // Drivers hours rules pre warning time delay
  10502: { name: 'out_of_scope_condition', unit: 'raw' }, // Out Of Scope Condition
  10503: { name: 'next_calibration_date', unit: 'Timestamp' }, // Next Calibration Date
  10504: { name: 'driver_1_end_of_last_daily_rest_report', unit: 'Timestamp' }, // Driver 1 end of last daily rest report
  10505: { name: 'driver_1_end_of_last_weekly_rest_period', unit: 'Timestamp' }, // Driver 1 end of last weekly rest period
  10506: { name: 'driver_1_end_of_second_last_weekly_rest_period', unit: 'Timestamp' }, // Driver 1 end of second last weekly rest period
  10507: { name: 'driver_1_current_daily_driving_time', unit: 'Minutes' }, // Driver 1 current daily driving time
  10508: { name: 'driver_1_current_weekly_driving_time', unit: 'Minutes' }, // Driver 1 current weekly driving time
  10509: { name: 'driver_1_time_left_until_new_daily_rest_period', unit: 'Minutes' }, // Driver 1 time left until new daily rest period
  10510: { name: 'driver_1_number_of_times_9h_daily_driving_time_exceeds', unit: 'raw' }, // Driver 1 number of times 9h daily driving time exceeds
  10511: { name: 'driver_2_end_of_last_daily_rest_report', unit: 'Timestamp' }, // Driver 2 end of last daily rest report
  10512: { name: 'driver_2_end_of_last_weekly_rest_period', unit: 'Timestamp' }, // Driver 2 end of last weekly rest period
  10513: { name: 'driver_2_end_of_second_last_weekly_rest_period', unit: 'Timestamp' }, // Driver 2 end of second last weekly rest period
  10514: { name: 'driver_2_current_daily_driving_time', unit: 'Minutes' }, // Driver 2 current daily driving time
  10515: { name: 'driver_2_current_weekly_driving_time', unit: 'Minutes' }, // Driver 2 current weekly driving time
  10516: { name: 'driver_2_time_left_until_new_daily_rest_period', unit: 'Minutes' }, // Driver 2 time left until new daily rest period
  10517: { name: 'driver_2_number_of_times_9h_daily_driving_time_exceeds', unit: 'raw' }, // Driver 2 number of times 9h daily driving time exceeds
  10518: { name: 'driver_1_name', unit: 'raw' }, // Driver 1 Name
  10519: { name: 'driver_1_surname', unit: 'raw' }, // Driver 1 SurName
  10520: { name: 'driver_2_name', unit: 'raw' }, // Driver 2 Name
  10521: { name: 'driver_2_surname', unit: 'raw' }, // Driver 2 SurName
  10522: { name: 'driver_1_time_left_until_new_weekly_rest_period', unit: 'Minutes' }, // Driver 1 Time Left Until New Weekly Rest Period
  10523: { name: 'driver_2_time_left_until_new_weekly_rest_period', unit: 'Minutes' }, // Driver 2 Time Left Until New Weekly Rest Period
  10524: { name: 'driver_1_minimum_daily_rest', unit: 'Minutes' }, // Driver 1 Minimum Daily Rest
  10525: { name: 'driver_2_minimum_daily_rest', unit: 'Minutes' }, // Driver 2 Minimum Daily Rest
  10526: { name: 'driver_1_minimum_weekly_rest', unit: 'Minutes' }, // Driver 1 Minimum Weekly Rest
  10527: { name: 'driver_2_minimum_weekly_rest', unit: 'Minutes' }, // Driver 2 Minimum Weekly Rest
  10528: { name: 'driver_1_duration_of_next_break_rest', unit: 'Minutes' }, // Driver 1 Duration Of Next Break Rest
  10529: { name: 'driver_2_duration_of_next_break_rest', unit: 'Minutes' }, // Driver 2 Duration Of Next Break Rest
  10530: { name: 'driver_1_remaining_time_until_next_break_or_rest', unit: 'Minutes' }, // Driver 1 Remaining Time Until Next Break Or Rest
  10531: { name: 'driver_2_remaining_time_until_next_break_or_rest', unit: 'Minutes' }, // Driver 2 Remaining Time Until Next Break Or Rest
  10532: { name: 'driver_1_remaining_current_driving_time', unit: 'Minutes' }, // Driver 1 Remaining Current Driving Time
  10533: { name: 'driver_1_remaining_driving_time_on_current_shift', unit: 'Minutes' }, // Driver 1 Remaining Driving Time On Current Shift
  10534: { name: 'driver_1_remaining_driving_time_of_current_week', unit: 'Minutes' }, // Driver 1 Remaining Driving Time Of Current Week
  10535: { name: 'driver_1_open_compensation_in_the_last_week', unit: 'Minutes' }, // Driver 1 Open Compensation In The Last Week
  10536: { name: 'driver_1_open_compensation_in_week_before_last', unit: 'Minutes' }, // Driver 1 Open Compensation In Week Before Last
  10537: { name: 'driver_1_open_compensation_in_2nd_week_before_last', unit: 'Minutes' }, // Driver 1 Open Compensation In 2nd Week Before Last
  10538: { name: 'driver_1_additional_information', unit: 'Bit encoded' }, // Driver 1 Additional Information
  10539: { name: 'driver_1_remaining_time_of_current_break_rest', unit: 'Minutes' }, // Driver 1 Remaining Time Of Current Break Rest
  10540: { name: 'driver_1_time_left_until_next_driving_period', unit: 'Minutes' }, // Driver 1 Time Left Until Next Driving Period
  10541: { name: 'driver_1_duration_of_next_driving_period', unit: 'Minutes' }, // Driver 1 Duration Of Next Driving Period
  10542: { name: 'border_crossing_info', unit: 'raw' }, // Border Crossing Info
  10543: { name: 'k_line_privacy_mode', unit: 'enum', values: { 0: 'privacy_mode_is_disabled', 1: 'privacy_mode_is_enabled', 2: 'no_kline_data' } }, // K-Line Privacy Mode
  10611: { name: 'rs232_com1data', unit: 'raw' }, // RS232_COM1Data
  10612: { name: 'rs232_com2data', unit: 'raw' }, // RS232_COM2Data
  10631: { name: 'lvcan_driver_seatbelt', unit: 'raw' }, // LVCAN Driver Seatbelt
  10632: { name: 'lvcan_front_passenger_seatbelt', unit: 'raw' }, // LVCAN Front Passenger Seatbelt
  10639: { name: 'error_codes', unit: 'raw' }, // Error Codes
  10640: { name: 'impulse_counter_frequency_1', unit: 'Hz' }, // Impulse counter frequency 1
  10641: { name: 'impulse_counter_rpm_1', unit: 'RPM' }, // Impulse counter RPM 1
  10642: { name: 'impulse_counter_frequency_2', unit: 'Hz' }, // Impulse counter frequency 2
  10643: { name: 'impulse_counter_rpm_2', unit: 'RPM' }, // Impulse counter RPM 2
  10644: { name: 'temperature_probe_1', unit: 'raw' }, // Temperature Probe 1
  10645: { name: 'temperature_probe_2', unit: 'raw' }, // Temperature Probe 2
  10646: { name: 'temperature_probe_3', unit: 'raw' }, // Temperature Probe 3
  10647: { name: 'temperature_probe_4', unit: 'raw' }, // Temperature Probe 4
  10648: { name: 'temperature_probe_5', unit: 'raw' }, // Temperature Probe 5
  10649: { name: 'temperature_probe_6', unit: 'raw' }, // Temperature Probe 6
  10683: { name: 'temperature_1', unit: '°C', scale: 0.1 }, // Temperature 1
  10684: { name: 'temperature_2', unit: '°C', scale: 0.1 }, // Temperature 2
  10685: { name: 'temperature_3', unit: '°C', scale: 0.1 }, // Temperature 3
  10686: { name: 'temperature_4', unit: '°C', scale: 0.1 }, // Temperature 4
  10687: { name: 'status_1', unit: 'raw' }, // Status 1
  10688: { name: 'status_2', unit: 'raw' }, // Status 2
  10689: { name: 'status_3', unit: 'raw' }, // Status 3
  10690: { name: 'status_4', unit: 'raw' }, // Status 4
  10691: { name: 'alarm_1', unit: 'raw' }, // Alarm 1
  10692: { name: 'alarm_2', unit: 'raw' }, // Alarm 2
  10693: { name: 'alarm_3', unit: 'raw' }, // Alarm 3
  10694: { name: 'alarm_4', unit: 'raw' }, // Alarm 4
  10695: { name: 'input_1', unit: '°C', scale: 0.1 }, // Input 1
  10696: { name: 'input_2', unit: '°C', scale: 0.1 }, // Input 2
  10697: { name: 'input_3', unit: '°C', scale: 0.1 }, // Input 3
  10698: { name: 'input_4', unit: '°C', scale: 0.1 }, // Input 4
  10699: { name: 'input_5', unit: '°C', scale: 0.1 }, // Input 5
  10700: { name: 'input_6', unit: '°C', scale: 0.1 }, // Input 6
  10701: { name: 'setpoint_1', unit: '°C', scale: 0.1 }, // Setpoint 1
  10702: { name: 'setpoint_2', unit: '°C', scale: 0.1 }, // Setpoint 2
  10703: { name: 'setpoint_3', unit: '°C', scale: 0.1 }, // Setpoint 3
  10879: { name: 'high_voltage_battery_voltage', unit: 'mV', scale: 50.0 }, // High voltage battery voltage
  10880: { name: 'high_voltage_battery_current', unit: 'mA', scale: 50.0 }, // High voltage battery current
  10881: { name: 'internal_charger_status', unit: 'raw' }, // Internal Charger Status
  10882: { name: 'generic_state_of_charge', unit: 'raw' }, // Generic state of charge
  10883: { name: 'ignition_10883', unit: 'raw' }, // Ignition
  10884: { name: 'external_energy_source_connection_status', unit: 'raw' }, // External Energy Source Connection Status
  10885: { name: 'seatbelt_switch', unit: 'raw' }, // Seatbelt switch
  10886: { name: 'evse1_ac_rms_current', unit: 'mA', scale: 50.0 }, // EVSE1 AC RMS Current
  10887: { name: 'evse1_ac_rms_voltage', unit: 'mV', scale: 50.0 }, // EVSE1 AC RMS Voltage
  10888: { name: 'dc_charging_state', unit: 'raw' }, // DC Charging State
  10889: { name: 'high_voltage_battery_highest_cell_temperature', unit: '°C', scale: 0.03125 }, // High Voltage Battery Highest Cell Temperature
  10890: { name: 'high_voltage_battery_lowest_cell_temperature', unit: '°C', scale: 0.03125 }, // High Voltage Battery Lowest Cell Temperature
  10891: { name: 'propulsion_motor_coolant_fan_1_control_temperature', unit: '°C', scale: 0.03125 }, // Propulsion Motor Coolant Fan 1 Control Temperature
  10892: { name: 'air_conditioner_compressor_status', unit: 'raw' }, // Air Conditioner Compressor Status
  10893: { name: 'high_voltage_battery_temperature', unit: '°C' }, // High Voltage Battery Temperature
  10894: { name: 'hvess_thermal_management_system_heater_status', unit: 'raw' }, // HVESS Thermal Management System Heater Status
  10895: { name: 'fuel_supply_estimated_remaining_distance', unit: 'km' }, // Fuel Supply Estimated Remaining Distance
  10896: { name: 'trailer_weight', unit: 'kg', scale: 2.0 }, // Trailer Weight
  10897: { name: 'cargo_weight', unit: 'kg', scale: 2.0 }, // Cargo Weight
  10898: { name: 'powered_vehicle_weight', unit: 'kg', scale: 10.0 }, // Powered Vehicle Weight
  10899: { name: 'gross_combination_vehicle_weight_10899', unit: 'kg', scale: 10.0 }, // Gross Combination Vehicle Weight
  10901: { name: 'highest_cell_voltage', unit: 'mV' }, // Highest cell voltage
  10902: { name: 'lowest_cell_voltage', unit: 'mV' }, // Lowest cell voltage
  10903: { name: 'hvess_nominal_rated_capacity', unit: '%' }, // HVESS Nominal Rated Capacity
  10904: { name: 'hvess_state_of_health', unit: '%', scale: 0.4 }, // HVESS State of Health
  10911: { name: 'impulse_counter_value_1', unit: 'raw' }, // Impulse counter value 1
  10912: { name: 'impulse_counter_value_3', unit: 'raw' }, // Impulse counter value 3
  10913: { name: 'impulse_counter_frequency_3', unit: 'Hz' }, // Impulse counter frequency 3
  10914: { name: 'impulse_counter_rpm_3', unit: 'rpm' }, // Impulse counter RPM 3
  10915: { name: 'impulse_counter_value_4', unit: 'raw' }, // Impulse counter value 4
  10916: { name: 'impulse_counter_frequency_4', unit: 'Hz' }, // Impulse counter frequency 4
  10917: { name: 'impulse_counter_rpm_4', unit: 'rpm' }, // Impulse counter RPM 4
  12301: { name: 'icam_dualcam1_front_state', unit: 'enum', values: { 0: 'camera_not_detected', 1: 'no_card', 2: 'card_mount_failed', 3: 'card_mounted', 4: 'card_faulty' } }, // iCam DualCam1 Front State
  12302: { name: 'icam_dualcam1_rear_state', unit: 'enum', values: { 0: 'camera_not_detected', 1: 'no_card', 2: 'card_mount_failed', 3: 'card_mounted', 4: 'card_faulty' } }, // iCam DualCam1 Rear State
  12303: { name: 'icam_dashcam1_state', unit: 'enum', values: { 0: 'camera_not_detected', 1: 'no_card', 2: 'card_mount_failed', 3: 'card_mounted', 4: 'card_faulty' } }, // iCam DashCam1 State
  12304: { name: 'icam_dualcam2_front_state', unit: 'enum', values: { 0: 'camera_not_detected', 1: 'no_card', 2: 'card_mount_failed', 3: 'card_mounted', 4: 'card_faulty' } }, // iCam DualCam2 Front State
  12305: { name: 'icam_dualcam2_rear_state', unit: 'enum', values: { 0: 'camera_not_detected', 1: 'no_card', 2: 'card_mount_failed', 3: 'card_mounted', 4: 'card_faulty' } }, // iCam DualCam2 Rear State
  12306: { name: 'icam_dashcam2_state', unit: 'enum', values: { 0: 'camera_not_detected', 1: 'no_card', 2: 'card_mount_failed', 3: 'card_mounted', 4: 'card_faulty' } }, // iCam DashCam2 State
  12400: { name: 'groundspeed_of_a_machine', unit: 'm/s', scale: 0.001 }, // Groundspeed of a machine
  12401: { name: 'ground_based_distance', unit: 'm', scale: 0.001 }, // Ground based distance
  12402: { name: 'ground_based_direction', unit: 'enum', values: { 0: 'reverse', 1: 'forward', 10: 'error_indication', 11: 'not_available' } }, // Ground based direction
  12403: { name: 'wheel_speed_of_a_machine', unit: 'm/s', scale: 0.001 }, // Wheel speed of a machine
  12404: { name: 'wheel_based_distance', unit: 'm', scale: 0.001 }, // Wheel based distance
  12405: { name: 'maximum_time_of_tractor_power', unit: 'min' }, // Maximum time of tractor power
  12406: { name: 'wheel_based_direction', unit: 'raw' }, // Wheel based direction
  12407: { name: 'key_switch_state', unit: 'enum', values: { 0: 'key_switch_off', 1: 'key_switch_not_off', 10: 'error_indication', 11: 'not_available' } }, // Key switch state
  12408: { name: 'start_stop_state', unit: 'enum', values: { 0: 'stop_or_disable_implement_work', 1: 'start_or_enable_implement_work', 10: 'error_indication', 11: 'not_available' } }, // Start/Stop state
  12409: { name: 'maintain_ecu_power', unit: 'enum', values: { 0: 'no_further_requirement_for_ecu_pw', 10: 'reserved', 11: 'don_t_care' } }, // Maintain ECU power
  12410: { name: 'maintain_actuator_power', unit: 'enum', values: { 0: 'no_further_requirement_for_pwr', 10: 'reserved', 11: 'don_t_care' } }, // Maintain actuator power
  12411: { name: 'implement_transport_state', unit: 'enum', values: { 0: 'implement_may_not_be_transported', 1: 'implement_may_be_transported', 10: 'error_indication', 11: 'not_available' } }, // Implement transport state
  12412: { name: 'implement_park_state', unit: 'enum', values: { 0: 'implement_may_not_be_disconnected', 1: 'implement_may_be_disconnected', 10: 'error_indication', 11: 'not_available' } }, // Implement park state
  12413: { name: 'implement_work_state', unit: 'enum', values: { 0: 'implement_is_not_ready_for_field_work', 1: 'implement_is_ready_for_field_work', 10: 'error_indication', 11: 'not_available' } }, // Implement work state
  12414: { name: 'front_hitch_position', unit: '%' }, // Front hitch position
  12415: { name: 'front_hitch_in_work_indication', unit: 'enum', values: { 0: 'hitch_position_is_out_of_work', 1: 'hitch_position_is_in_work', 10: 'error_indication', 11: 'not_available' } }, // Front hitch in-work indication
  12416: { name: 'front_nominal_lower_link_force', unit: '%' }, // Front nominal lower link force
  12417: { name: 'front_draft', unit: 'N' }, // Front draft
  12418: { name: 'rear_hitch_position', unit: '%' }, // Rear hitch position
  12419: { name: 'rear_hitch_in_work_indication', unit: 'enum', values: { 0: 'hitch_position_is_out_of_work', 1: 'hitch_position_is_in_work', 10: 'error_indication', 11: 'not_available' } }, // Rear hitch in-work indication
  12420: { name: 'rear_nominal_lower_link_force', unit: '%' }, // Rear nominal lower link force
  12421: { name: 'rear_draft', unit: 'N' }, // Rear draft
  12422: { name: 'front_pto_output_shaft_speed', unit: '1/min', scale: 0.001 }, // Front PTO output shaft speed
  12423: { name: 'front_pto_shaft_speed_point', unit: '1/min', scale: 0.001 }, // Front PTO shaft speed point
  12424: { name: 'front_pto_engagement', unit: 'enum', values: { 0: 'pto_disengaged', 1: 'pto_engaged', 10: 'error_indication', 11: 'not_available' } }, // Front PTO engagement
  12425: { name: 'front_pto_mode', unit: 'enum', values: { 10: 'error_indication', 11: 'not_available' } }, // Front PTO mode
  12426: { name: 'front_pto_economy_mode', unit: 'enum', values: { 0: 'pto_economy_mode_is_disengaged', 1: 'pto_economy_mode_is_engaged', 10: 'error_indication', 11: 'not_available' } }, // Front PTO economy mode
  12427: { name: 'rear_pto_output_shaft_speed', unit: '1/min', scale: 0.001 }, // Rear PTO output shaft speed
  12428: { name: 'rear_pto_shaft_speed_point', unit: '1/min', scale: 0.001 }, // Rear PTO shaft speed point
  12429: { name: 'rear_pto_engagement', unit: 'enum', values: { 0: 'pto_disengaged', 1: 'pto_engaged', 10: 'error_indication', 11: 'not_available' } }, // Rear PTO engagement
  12430: { name: 'rear_pto_mode', unit: 'enum', values: { 10: 'error_indication', 11: 'not_available' } }, // Rear PTO mode
  12431: { name: 'rear_pto_economy_mode', unit: 'enum', values: { 0: 'pto_economy_mode_is_disengaged', 1: 'pto_economy_mode_is_engaged', 10: 'error_indication', 11: 'not_available' } }, // Rear PTO economy mode
  12432: { name: 'front_hitch_position_command', unit: '%' }, // Front hitch position command
  12433: { name: 'rear_hitch_position_command', unit: '%' }, // Rear hitch position command
  12434: { name: 'front_shaft_speed_set_point_command', unit: '1/min', scale: 0.001 }, // Front Shaft speed set point command
  12435: { name: 'rear_shaft_speed_set_point_command', unit: '1/min', scale: 0.001 }, // Rear Shaft speed set point command
  12436: { name: 'front_pto_engagement_command', unit: 'enum', values: { 0: 'pto_disengaged', 1: 'pto_engaged', 10: 'reserved', 11: 'don_t_care' } }, // Front PTO engagement command
  12437: { name: 'rear_pto_engagement_command', unit: 'enum', values: { 0: 'pto_disengaged', 1: 'pto_engaged', 10: 'reserved', 11: 'don_t_care' } }, // Rear PTO engagement command
  12438: { name: 'front_pto_mode_command', unit: 'enum', values: { 10: 'reserved', 11: 'don_t_care' } }, // Front PTO mode command
  12439: { name: 'rear_pto_mode_command', unit: 'enum', values: { 10: 'reserved', 11: 'don_t_care' } }, // Rear PTO mode command
  12440: { name: 'front_pto_economy_mode_command', unit: 'enum', values: { 0: 'disengage_pto_economy_mode', 1: 'engage_pto_economy_mode', 10: 'reserved', 11: 'don_t_care' } }, // Front PTO economy mode command
  12441: { name: 'rear_pto_economy_mode_command', unit: 'enum', values: { 0: 'disengage_pto_economy_mode', 1: 'engage_pto_economy_mode', 10: 'reserved', 11: 'don_t_care' } }, // Rear PTO economy mode command
  12442: { name: 'auxil_ext_valve_number_0', unit: '%' }, // Auxil ext valve number 0
  12443: { name: 'auxil_ext_valve_number_1', unit: '%' }, // Auxil ext valve number 1
  12444: { name: 'auxil_ext_valve_number_2', unit: '%' }, // Auxil ext valve number 2
  12445: { name: 'auxil_ext_valve_number_3', unit: '%' }, // Auxil ext valve number 3
  12446: { name: 'auxil_ext_valve_number_4', unit: '%' }, // Auxil ext valve number 4
  12447: { name: 'auxil_ext_valve_number_5', unit: '%' }, // Auxil ext valve number 5
  12448: { name: 'auxil_ext_valve_number_6', unit: '%' }, // Auxil ext valve number 6
  12449: { name: 'auxil_ext_valve_number_7', unit: '%' }, // Auxil ext valve number 7
  12450: { name: 'auxil_ext_valve_number_8', unit: '%' }, // Auxil ext valve number 8
  12452: { name: 'auxil_ext_valve_number_10', unit: '%' }, // Auxil ext valve number 10
  12453: { name: 'auxil_ext_valve_number_11', unit: '%' }, // Auxil ext valve number 11
  12454: { name: 'auxil_ext_valve_number_12', unit: '%' }, // Auxil ext valve number 12
  12455: { name: 'auxil_ext_valve_number_13', unit: '%' }, // Auxil ext valve number 13
  12456: { name: 'auxil_ext_valve_number_14', unit: '%' }, // Auxil ext valve number 14
  12457: { name: 'auxil_ext_valve_number_15', unit: '%' }, // Auxil ext valve number 15
  12458: { name: 'auxil_ret_valve_number_0', unit: '%' }, // Auxil ret valve number 0
  12459: { name: 'auxil_ret_valve_number_1', unit: '%' }, // Auxil ret valve number 1
  12460: { name: 'auxil_ret_valve_number_2', unit: '%' }, // Auxil ret valve number 2
  12461: { name: 'auxil_ret_valve_number_3', unit: '%' }, // Auxil ret valve number 3
  12462: { name: 'auxil_ret_valve_number_4', unit: '%' }, // Auxil ret valve number 4
  12463: { name: 'auxil_ret_valve_number_5', unit: '%' }, // Auxil ret valve number 5
  12464: { name: 'auxil_ret_valve_number_6', unit: '%' }, // Auxil ret valve number 6
  12465: { name: 'auxil_ret_valve_number_7', unit: '%' }, // Auxil ret valve number 7
  12466: { name: 'auxil_ret_valve_number_8', unit: '%' }, // Auxil ret valve number 8
  12467: { name: 'auxil_ret_valve_number_9', unit: '%' }, // Auxil ret valve number 9
  12468: { name: 'auxil_ret_valve_number_10', unit: '%' }, // Auxil ret valve number 10
  12469: { name: 'auxil_ret_valve_number_11', unit: '%' }, // Auxil ret valve number 11
  12470: { name: 'auxil_ret_valve_number_12', unit: '%' }, // Auxil ret valve number 12
  12471: { name: 'auxil_ret_valve_number_13', unit: '%' }, // Auxil ret valve number 13
  12472: { name: 'auxil_ret_valve_number_14', unit: '%' }, // Auxil ret valve number 14
  12473: { name: 'auxil_ret_valve_number_15', unit: '%' }, // Auxil ret valve number 15
  12474: { name: '0_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 0 valve fail safe state
  12475: { name: '1_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 1 valve fail safe state
  12476: { name: '2_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 2 valve fail safe state
  12477: { name: '3_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 3 valve fail safe state
  12478: { name: '4_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 4 valve fail safe state
  12479: { name: '5_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 5 valve fail safe state
  12480: { name: '6_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 6 valve fail safe state
  12481: { name: '7_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 7 valve fail safe state
  12482: { name: '8_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 8 valve fail safe state
  12483: { name: '9_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 9 valve fail safe state
  12484: { name: '10_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 10 valve fail safe state
  12485: { name: '11_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 11 valve fail safe state
  12486: { name: '12_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 12 valve fail safe state
  12487: { name: '13_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 13 valve fail safe state
  12488: { name: '14_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 14 valve fail safe state
  12489: { name: '15_valve_fail_safe_state', unit: 'enum', values: { 0: 'block', 1: 'float', 10: 'error_indication', 11: 'not_available' } }, // 15 valve fail safe state
  12490: { name: '0_valve_state', unit: 'raw' }, // 0 valve state
  12491: { name: '1_valve_state', unit: 'raw' }, // 1 valve state
  12492: { name: '2_valve_state', unit: 'raw' }, // 2 valve state
  12493: { name: '3_valve_state', unit: 'raw' }, // 3 valve state
  12494: { name: '4_valve_state', unit: 'raw' }, // 4 valve state
  12495: { name: '5_valve_state', unit: 'raw' }, // 5 valve state
  12496: { name: '6_valve_state', unit: 'raw' }, // 6 valve state
  12497: { name: '7_valve_state', unit: 'raw' }, // 7 valve state
  12498: { name: '8_valve_state', unit: 'raw' }, // 8 valve state
  12499: { name: '9_valve_state', unit: 'raw' }, // 9 valve state
  12500: { name: '10_valve_state', unit: 'raw' }, // 10 valve state
  12501: { name: '11_valve_state', unit: 'raw' }, // 11 valve state
  12502: { name: '12_valve_state', unit: 'raw' }, // 12 valve state
  12503: { name: '13_valve_state', unit: 'raw' }, // 13 valve state
  12504: { name: '14_valve_state', unit: 'raw' }, // 14 valve state
  12505: { name: '15_valve_state', unit: 'raw' }, // 15 valve state
  12506: { name: 'extend_port_measured_flow_0', unit: '%' }, // Extend Port Measured Flow 0
  12507: { name: 'extend_port_measured_flow_1', unit: '%' }, // Extend Port Measured Flow 1
  12508: { name: 'extend_port_measured_flow_2', unit: '%' }, // Extend Port Measured Flow 2
  12509: { name: 'extend_port_measured_flow_3', unit: '%' }, // Extend Port Measured Flow 3
  12510: { name: 'extend_port_measured_flow_4', unit: '%' }, // Extend Port Measured Flow 4
  12511: { name: 'extend_port_measured_flow_5', unit: '%' }, // Extend Port Measured Flow 5
  12512: { name: 'extend_port_measured_flow_6', unit: '%' }, // Extend Port Measured Flow 6
  12513: { name: 'extend_port_measured_flow_7', unit: '%' }, // Extend Port Measured Flow 7
  12514: { name: 'extend_port_measured_flow_8', unit: '%' }, // Extend Port Measured Flow 8
  12515: { name: 'extend_port_measured_flow_9', unit: '%' }, // Extend Port Measured Flow 9
  12516: { name: 'extend_port_measured_flow_10', unit: '%' }, // Extend Port Measured Flow 10
  12517: { name: 'extend_port_measured_flow_11', unit: '%' }, // Extend Port Measured Flow 11
  12518: { name: 'extend_port_measured_flow_12', unit: '%' }, // Extend Port Measured Flow 12
  12519: { name: 'extend_port_measured_flow_13', unit: '%' }, // Extend Port Measured Flow 13
  12520: { name: 'extend_port_measured_flow_14', unit: '%' }, // Extend Port Measured Flow 14
  12521: { name: 'retract_port_measured_flow_15', unit: '%' }, // Retract Port Measured Flow 15
  12522: { name: 'retract_port_measured_flow_0', unit: '%' }, // Retract Port Measured Flow 0
  12523: { name: 'retract_port_measured_flow_1', unit: '%' }, // Retract Port Measured Flow 1
  12524: { name: 'retract_port_measured_flow_2', unit: '%' }, // Retract Port Measured Flow 2
  12525: { name: 'retract_port_measured_flow_3', unit: '%' }, // Retract Port Measured Flow 3
  12526: { name: 'retract_port_measured_flow_4', unit: '%' }, // Retract Port Measured Flow 4
  12527: { name: 'retract_port_measured_flow_5', unit: '%' }, // Retract Port Measured Flow 5
  12528: { name: 'retract_port_measured_flow_6', unit: '%' }, // Retract Port Measured Flow 6
  12529: { name: 'retract_port_measured_flow_7', unit: '%' }, // Retract Port Measured Flow 7
  12530: { name: 'retract_port_measured_flow_8', unit: '%' }, // Retract Port Measured Flow 8
  12531: { name: 'retract_port_measured_flow_9', unit: '%' }, // Retract Port Measured Flow 9
  12532: { name: 'retract_port_measured_flow_10', unit: '%' }, // Retract Port Measured Flow 10
  12533: { name: 'retract_port_measured_flow_11', unit: '%' }, // Retract Port Measured Flow 11
  12534: { name: 'retract_port_measured_flow_12', unit: '%' }, // Retract Port Measured Flow 12
  12535: { name: 'retract_port_measured_flow_13', unit: '%' }, // Retract Port Measured Flow 13
  12536: { name: 'retract_port_measured_flow_14', unit: '%' }, // Retract Port Measured Flow 14
  12537: { name: 'retract_port_measured_flow_15_12537', unit: '%' }, // Retract Port Measured Flow 15
  12538: { name: 'extend_port_pressure_0', unit: 'kPa' }, // Extend Port Pressure 0
  12539: { name: 'extend_port_pressure_1', unit: 'kPa' }, // Extend Port Pressure 1
  12540: { name: 'extend_port_pressure_2', unit: 'kPa' }, // Extend Port Pressure 2
  12541: { name: 'extend_port_pressure_3', unit: 'kPa' }, // Extend Port Pressure 3
  12542: { name: 'extend_port_pressure_4', unit: 'kPa' }, // Extend Port Pressure 4
  12543: { name: 'extend_port_pressure_5', unit: 'kPa' }, // Extend Port Pressure 5
  12544: { name: 'extend_port_pressure_6', unit: 'kPa' }, // Extend Port Pressure 6
  12545: { name: 'extend_port_pressure_7', unit: 'kPa' }, // Extend Port Pressure 7
  12546: { name: 'extend_port_pressure_8', unit: 'kPa' }, // Extend Port Pressure 8
  12547: { name: 'extend_port_pressure_9', unit: 'kPa' }, // Extend Port Pressure 9
  12548: { name: 'extend_port_pressure_10', unit: 'kPa' }, // Extend Port Pressure 10
  12549: { name: 'extend_port_pressure_11', unit: 'kPa' }, // Extend Port Pressure 11
  12550: { name: 'extend_port_pressure_12', unit: 'kPa' }, // Extend Port Pressure 12
  12551: { name: 'extend_port_pressure_13', unit: 'kPa' }, // Extend Port Pressure 13
  12552: { name: 'extend_port_pressure_14', unit: 'kPa' }, // Extend Port Pressure 14
  12553: { name: 'extend_port_pressure_15', unit: 'kPa' }, // Extend Port Pressure 15
  12554: { name: 'retract_port_pressure_0', unit: 'kPa' }, // Retract Port Pressure 0
  12555: { name: 'retract_port_pressure_1', unit: 'kPa' }, // Retract Port Pressure 1
  12556: { name: 'retract_port_pressure_2', unit: 'kPa' }, // Retract Port Pressure 2
  12557: { name: 'retract_port_pressure_3', unit: 'kPa' }, // Retract Port Pressure 3
  12558: { name: 'retract_port_pressure_4', unit: 'kPa' }, // Retract Port Pressure 4
  12559: { name: 'retract_port_pressure_5', unit: 'kPa' }, // Retract Port Pressure 5
  12560: { name: 'retract_port_pressure_6', unit: 'kPa' }, // Retract Port Pressure 6
  12561: { name: 'retract_port_pressure_7', unit: 'kPa' }, // Retract Port Pressure 7
  12562: { name: 'retract_port_pressure_8', unit: 'kPa' }, // Retract Port Pressure 8
  12563: { name: 'retract_port_pressure_9', unit: 'kPa' }, // Retract Port Pressure 9
  12564: { name: 'retract_port_pressure_10', unit: 'kPa' }, // Retract Port Pressure 10
  12565: { name: 'retract_port_pressure_11', unit: 'kPa' }, // Retract Port Pressure 11
  12566: { name: 'retract_port_pressure_12', unit: 'kPa' }, // Retract Port Pressure 12
  12567: { name: 'retract_port_pressure_13', unit: 'kPa' }, // Retract Port Pressure 13
  12568: { name: 'retract_port_pressure_14', unit: 'kPa' }, // Retract Port Pressure 14
  12569: { name: 'retract_port_pressure_15', unit: 'kPa' }, // Retract Port Pressure 15
  12570: { name: 'return_port_pressure_0', unit: 'kPa' }, // Return Port Pressure 0
  12571: { name: 'return_port_pressure_1', unit: 'kPa' }, // Return Port Pressure 1
  12572: { name: 'return_port_pressure_2', unit: 'kPa' }, // Return Port Pressure 2
  12573: { name: 'return_port_pressure_3', unit: 'kPa' }, // Return Port Pressure 3
  12574: { name: 'return_port_pressure_4', unit: 'kPa' }, // Return Port Pressure 4
  12575: { name: 'return_port_pressure_5', unit: 'kPa' }, // Return Port Pressure 5
  12576: { name: 'return_port_pressure_6', unit: 'kPa' }, // Return Port Pressure 6
  12577: { name: 'return_port_pressure_7', unit: 'kPa' }, // Return Port Pressure 7
  12578: { name: 'return_port_pressure_8', unit: 'kPa' }, // Return Port Pressure 8
  12579: { name: 'return_port_pressure_9', unit: 'kPa' }, // Return Port Pressure 9
  12580: { name: 'return_port_pressure_10', unit: 'kPa' }, // Return Port Pressure 10
  12581: { name: 'return_port_pressure_11', unit: 'kPa' }, // Return Port Pressure 11
  12582: { name: 'return_port_pressure_12', unit: 'kPa' }, // Return Port Pressure 12
  12583: { name: 'return_port_pressure_13', unit: 'kPa' }, // Return Port Pressure 13
  12584: { name: 'return_port_pressure_14', unit: 'kPa' }, // Return Port Pressure 14
  12585: { name: 'return_port_pressure_15', unit: 'kPa' }, // Return Port Pressure 15
  12586: { name: 'valve_port_flow_0', unit: '%' }, // valve port flow 0
  12587: { name: 'valve_port_flow_1', unit: '%' }, // valve port flow 1
  12588: { name: 'valve_port_flow_2', unit: '%' }, // valve port flow 2
  12589: { name: 'valve_port_flow_3', unit: '%' }, // valve port flow 3
  12590: { name: 'valve_port_flow_4', unit: '%' }, // valve port flow 4
  12591: { name: 'valve_port_flow_5', unit: '%' }, // valve port flow 5
  12592: { name: 'valve_port_flow_6', unit: '%' }, // valve port flow 6
  12593: { name: 'valve_port_flow_7', unit: '%' }, // valve port flow 7
  12594: { name: 'valve_port_flow_8', unit: '%' }, // valve port flow 8
  12595: { name: 'valve_port_flow_9', unit: '%' }, // valve port flow 9
  12596: { name: 'valve_port_flow_10', unit: '%' }, // valve port flow 10
  12597: { name: 'valve_port_flow_11', unit: '%' }, // valve port flow 11
  12598: { name: 'valve_port_flow_12', unit: '%' }, // valve port flow 12
  12599: { name: 'valve_port_flow_13', unit: '%' }, // valve port flow 13
  12600: { name: 'valve_port_flow_14', unit: '%' }, // valve port flow 14
  12601: { name: 'valve_port_flow_15', unit: '%' }, // valve port flow 15
  12602: { name: 'valve_safe_mode_command_0', unit: 'raw' }, // valve safe mode command 0
  12603: { name: 'valve_safe_mode_command_1', unit: 'raw' }, // valve safe mode command 1
  12604: { name: 'valve_safe_mode_command_2', unit: 'raw' }, // valve safe mode command 2
  12605: { name: 'valve_safe_mode_command_3', unit: 'raw' }, // valve safe mode command 3
  12606: { name: 'valve_safe_mode_command_4', unit: 'raw' }, // valve safe mode command 4
  12607: { name: 'valve_safe_mode_command_5', unit: 'raw' }, // valve safe mode command 5
  12608: { name: 'valve_safe_mode_command_6', unit: 'raw' }, // valve safe mode command 6
  12609: { name: 'valve_safe_mode_command_7', unit: 'raw' }, // valve safe mode command 7
  12610: { name: 'valve_safe_mode_command_8', unit: 'raw' }, // valve safe mode command 8
  12611: { name: 'valve_safe_mode_command_9', unit: 'raw' }, // valve safe mode command 9
  12612: { name: 'valve_safe_mode_command_10', unit: 'raw' }, // valve safe mode command 10
  12613: { name: 'valve_safe_mode_command_11', unit: 'raw' }, // valve safe mode command 11
  12614: { name: 'valve_safe_mode_command_12', unit: 'raw' }, // valve safe mode command 12
  12615: { name: 'valve_safe_mode_command_13', unit: 'raw' }, // valve safe mode command 13
  12616: { name: 'valve_safe_mode_command_14', unit: 'raw' }, // valve safe mode command 14
  12617: { name: 'valve_safe_mode_command_15', unit: 'raw' }, // valve safe mode command 15
  12618: { name: 'valve_state_command_0', unit: 'raw' }, // valve state command 0
  12619: { name: 'valve_state_command_1', unit: 'raw' }, // valve state command 1
  12620: { name: 'valve_state_command_2', unit: 'raw' }, // valve state command 2
  12621: { name: 'valve_state_command_3', unit: 'raw' }, // valve state command 3
  12622: { name: 'valve_state_command_4', unit: 'raw' }, // valve state command 4
  12623: { name: 'valve_state_command_5', unit: 'raw' }, // valve state command 5
  12624: { name: 'valve_state_command_6', unit: 'raw' }, // valve state command 6
  12625: { name: 'valve_state_command_7', unit: 'raw' }, // valve state command 7
  12626: { name: 'valve_state_command_8', unit: 'raw' }, // valve state command 8
  12627: { name: 'valve_state_command_9', unit: 'raw' }, // valve state command 9
  12628: { name: 'valve_state_command_10', unit: 'raw' }, // valve state command 10
  12629: { name: 'valve_state_command_11', unit: 'raw' }, // valve state command 11
  12630: { name: 'valve_state_command_12', unit: 'raw' }, // valve state command 12
  12631: { name: 'valve_state_command_13', unit: 'raw' }, // valve state command 13
  12632: { name: 'valve_state_command_14', unit: 'raw' }, // valve state command 14
  12633: { name: 'valve_state_command_15', unit: 'raw' }, // valve state command 15
  12634: { name: 'tractor_high_beam_head_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Tractor high-beam head lights
  12635: { name: 'tractor_low_beam_head_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Tractor low-beam head lights
  12636: { name: 'tractor_alternate_head_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Tractor alternate head lights
  12637: { name: 'daytime_running_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Daytime running lights
  12638: { name: 'left_turn_signal_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Left-turn signal lights
  12639: { name: 'right_turn_signal_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Right-turn signal lights
  12640: { name: 'beacon_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Beacon lights
  12641: { name: 'front_fog_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Front fog lights
  12642: { name: 'left_stop_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Left stop lights
  12643: { name: 'right_stop_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Right stop lights
  12644: { name: 'centre_stop_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Centre stop lights
  12645: { name: 'back_up_light_and_alarm_horn', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Back up light and alarm horn
  12646: { name: 'tractor_marker_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Tractor marker lights
  12647: { name: 'implement_marker_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement marker lights
  12648: { name: 'tractor_clearance_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Tractor clearance lights
  12649: { name: 'implement_clearance_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement clearance lights
  12650: { name: 'rear_high_mounted_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Rear high mounted work lights
  12651: { name: 'rear_low_mounted_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Rear low mounted work lights
  12652: { name: 'underside_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Underside work lights
  12653: { name: 'rear_fog_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Rear fog lights
  12654: { name: 'front_high_mounted_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Front high-mounted work lights
  12655: { name: 'front_low_mounted_work_light', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Front low-mounted work light
  12656: { name: 'side_high_mounted_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Side high-mounted work lights
  12657: { name: 'side_low_mounted_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Side low mounted work lights
  12658: { name: 'implement_left_forward_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement left forward work lights
  12659: { name: 'implement_right_forward_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement right forward work lights
  12660: { name: 'implement_oem_option_1_light', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement OEM option 1 light
  12661: { name: 'implement_oem_option_2_light', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement OEM option 2 light
  12662: { name: 'implement_rear_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement rear work lights
  12663: { name: 'implement_left_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement left work lights
  12664: { name: 'implement_right_work_lights', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Implement right work lights
  12665: { name: 'lighting_data_message_request', unit: 'enum', values: { 0: 'deactivate', 1: 'activate', 10: 'reserved', 11: 'don_t_care' } }, // Lighting data message request
  12666: { name: 'tractor_high_beam_head_lights_12666', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Tractor high-beam head lights
  12667: { name: 'tractor_low_beam_head_lights_12667', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Tractor low-beam head lights
  12668: { name: 'tractor_alternate_head_lights_12668', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Tractor alternate head lights
  12669: { name: 'daytime_running_lights_12669', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Daytime running lights
  12670: { name: 'left_turn_signal_lights_12670', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Left-turn signal lights
  12671: { name: 'right_turn_signal_lights_12671', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Right-turn signal lights
  12672: { name: 'beacon_lights_12672', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Beacon lights
  12673: { name: 'front_fog_lights_12673', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Front fog lights
  12674: { name: 'left_stop_lights_12674', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Left stop lights
  12675: { name: 'right_stop_lights_12675', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Right stop lights
  12676: { name: 'centre_stop_lights_12676', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Centre stop lights
  12677: { name: 'back_up_light_and_alarm_horn_12677', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Back up light and alarm horn
  12678: { name: 'tractor_marker_lights_12678', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Tractor marker lights
  12679: { name: 'implement_marker_lights_12679', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement marker lights
  12680: { name: 'tractor_clearance_lights_12680', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Tractor clearance lights
  12681: { name: 'implement_clearance_lights_12681', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement clearance lights
  12682: { name: 'rear_high_mounted_work_lights_12682', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Rear high mounted work lights
  12683: { name: 'rear_low_mounted_work_lights_12683', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Rear low mounted work lights
  12684: { name: 'underside_work_lights_12684', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Underside work lights
  12685: { name: 'rear_fog_lights_12685', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Rear fog lights
  12686: { name: 'front_high_mounted_work_lights_12686', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Front high-mounted work lights
  12687: { name: 'front_low_mounted_work_light_12687', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Front low-mounted work light
  12688: { name: 'side_high_mounted_work_lights_12688', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Side high-mounted work lights
  12689: { name: 'side_low_mounted_work_lights_12689', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Side low mounted work lights
  12690: { name: 'implement_left_forward_work_lights_12690', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement left forward work lights
  12691: { name: 'implement_right_forward_work_lights_12691', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement right forward work lights
  12692: { name: 'implement_oem_option_1_light_12692', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement OEM option 1 light
  12693: { name: 'implement_oem_option_2_light_12693', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement OEM option 2 light
  12694: { name: 'implement_rear_work_lights_12694', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement rear work lights
  12695: { name: 'implement_left_work_lights_12695', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement left work lights
  12696: { name: 'implement_right_work_lights_12696', unit: 'enum', values: { 0: 'deactivated', 1: 'activated', 10: 'fault_detected', 11: 'not_available' } }, // Implement right work lights
  12697: { name: 'background_illumination_level', unit: '%' }, // Background illumination level
  12710: { name: 'security_state_flags_p4', unit: 'raw' }, // Security State Flags P4
  12711: { name: 'control_state_flags_p4', unit: 'raw' }, // Control State Flags P4
  12712: { name: 'indicator_state_flags_p4', unit: 'raw' }, // Indicator State Flags P4
  12713: { name: 'ssf_ignition_on', unit: 'raw' }, // SSF Ignition On
  12714: { name: 'drive_right_keyinignition_lock', unit: 'raw' }, // Drive Right KeyInIgnition Lock
  12715: { name: 'ssf_webasto', unit: 'raw' }, // SSF Webasto
  12716: { name: 'ssf_engine_working', unit: 'raw' }, // SSF Engine Working
  12717: { name: 'ssf_standalone_engine', unit: 'raw' }, // SSF Standalone Engine
  12718: { name: 'ssf_ready_to_drive', unit: 'raw' }, // SSF Ready To Drive
  12719: { name: 'ssf_engine_working_on_cng', unit: 'raw' }, // SSF Engine Working On CNG
  12720: { name: 'ssf_work_mode', unit: 'raw' }, // SSF Work Mode
  12721: { name: 'ssf_operator', unit: 'raw' }, // SSF Operator
  12722: { name: 'ssf_interlock', unit: 'raw' }, // SSF Interlock
  12723: { name: 'ssf_engine_lock_active', unit: 'raw' }, // SSF Engine Lock Active
  12724: { name: 'ssf_request_to_lock_engine', unit: 'raw' }, // SSF Request To Lock Engine
  12725: { name: 'drive_right_handbrake_active', unit: 'raw' }, // Drive Right Handbrake Active
  12726: { name: 'ssf_footbrake_actuated', unit: 'raw' }, // SSF Footbrake Actuated
  12727: { name: 'ssf_clutch_pushed', unit: 'raw' }, // SSF Clutch Pushed
  12728: { name: 'ssf_hazard_warning_lights', unit: 'raw' }, // SSF Hazard Warning Lights
  12729: { name: 'drive_r_front_l_door_opened', unit: 'raw' }, // Drive R Front L Door Opened
  12730: { name: 'drive_r_rear_l_door_opened', unit: 'raw' }, // Drive R Rear L Door Opened
  12731: { name: 'drive_r_rear_r_door_opened', unit: 'raw' }, // Drive R Rear R Door Opened
  12732: { name: 'drive_r_trunk_door_opened', unit: 'raw' }, // Drive R Trunk Door Opened
  12733: { name: 'ssf_engine_cover_open', unit: 'raw' }, // SSF Engine Cover Open
  12734: { name: 'ssf_roof_open', unit: 'raw' }, // SSF Roof Open
  12735: { name: 'ssf_charging_wire_plugged', unit: 'raw' }, // SSF Charging Wire Plugged
  12736: { name: 'ssf_battery_charging', unit: 'raw' }, // SSF Battery Charging
  12737: { name: 'ssf_electric_engine_state', unit: 'raw' }, // SSF Electric Engine State
  12738: { name: 'ssf_car_closed_factory_remote', unit: 'raw' }, // SSF Car Closed Factory Remote
  12739: { name: 'drive_right_car_closed', unit: 'raw' }, // Drive Right Car Closed
  12740: { name: 'ssf_factory_alarm_actuated', unit: 'raw' }, // SSF Factory Alarm Actuated
  12741: { name: 'ssf_factory_alarm_emulated', unit: 'raw' }, // SSF Factory Alarm Emulated
  12742: { name: 'ssf_signal_close_factory_rem', unit: 'raw' }, // SSF Signal Close Factory Rem
  12743: { name: 'ssf_signal_open_factory_rem', unit: 'raw' }, // SSF Signal Open Factory Rem
  12744: { name: 'ssf_rearming_signal', unit: 'raw' }, // SSF Rearming Signal
  12745: { name: 'ssf_can_module_in_sleep', unit: 'raw' }, // SSF CAN Module In Sleep
  12746: { name: 'ssf_factory_remote_3x', unit: 'raw' }, // SSF Factory Remote 3x
  12747: { name: 'ssf_factory_armed', unit: 'raw' }, // SSF Factory Armed
  12748: { name: 'ssf_drive_active', unit: 'raw' }, // SSF Drive Active
  12749: { name: 'drive_r_parking_gear_active', unit: 'raw' }, // Drive R Parking Gear Active
  12750: { name: 'drive_r_reverse_gear_active', unit: 'raw' }, // Drive R Reverse Gear Active
  12751: { name: 'drive_r_neutral_gear_active', unit: 'raw' }, // Drive R Neutral Gear Active
  12752: { name: 'ssf_enginework_on_dual_fuel', unit: 'raw' }, // SSF EngineWork On Dual Fuel
  12753: { name: 'ssf_engine_work_on_lpg', unit: 'raw' }, // SSF Engine Work On LPG
  12754: { name: 'csf_parking_lights_on', unit: 'raw' }, // CSF Parking Lights On
  12755: { name: 'csf_dipped_head_lights_on', unit: 'raw' }, // CSF Dipped Head lights On
  12756: { name: 'csf_full_beam_head_lights_on', unit: 'raw' }, // CSF Full Beam Head lights On
  12757: { name: 'csf_rear_fog_lights_on', unit: 'raw' }, // CSF Rear Fog Lights On
  12758: { name: 'csf_front_fog_lights_on', unit: 'raw' }, // CSF Front Fog Lights On
  12759: { name: 'csf_additional_front_lights_on', unit: 'raw' }, // CSF Additional Front Lights On
  12760: { name: 'csf_additional_rear_lights_on', unit: 'raw' }, // CSF Additional Rear Lights On
  12761: { name: 'csf_light_signal_on', unit: 'raw' }, // CSF Light Signal On
  12762: { name: 'csf_trailer_connected', unit: 'raw' }, // CSF Trailer Connected
  12763: { name: 'csf_air_cond_on', unit: 'raw' }, // CSF Air Cond On
  12764: { name: 'csf_cruise_control_on', unit: 'raw' }, // CSF Cruise Control On
  12765: { name: 'csf_automatic_retarded_on', unit: 'raw' }, // CSF Automatic Retarded On
  12766: { name: 'csf_manual_retarded_on', unit: 'raw' }, // CSF Manual Retarded On
  12767: { name: 'csf_driver_seatbelt', unit: 'raw' }, // CSF Driver Seatbelt
  12768: { name: 'csf_front_pass_seatbelt', unit: 'raw' }, // CSF Front Pass Seatbelt
  12769: { name: 'csf_rear_left_pass_seatbelt', unit: 'raw' }, // CSF Rear Left Pass Seatbelt
  12770: { name: 'csf_rear_right_pass_seatbelt', unit: 'raw' }, // CSF Rear Right Pass Seatbelt
  12771: { name: 'csf_rear_centre_pass_seatbelt', unit: 'raw' }, // CSF Rear Centre Pass Seatbelt
  12772: { name: 'csf_front_pass_present', unit: 'raw' }, // CSF Front Pass Present
  12773: { name: 'csf_start_stop_system_inactive', unit: 'raw' }, // CSF Start Stop System Inactive
  12774: { name: 'csf_pto', unit: 'raw' }, // CSF PTO
  12775: { name: 'csf_front_differential_locked', unit: 'raw' }, // CSF Front Differential Locked
  12776: { name: 'csf_rear_differential_locked', unit: 'raw' }, // CSF Rear Differential Locked
  12777: { name: 'csf_central_diff4hi_locked', unit: 'raw' }, // CSF Central Diff4HI Locked
  12778: { name: 'csf_central_diff4lo_locked', unit: 'raw' }, // CSF Central Diff4LO Locked
  12779: { name: 'csf_trailer_axle1_lift_active', unit: 'raw' }, // CSF Trailer Axle1 Lift Active
  12780: { name: 'csf_trailer_axle2_lift_active', unit: 'raw' }, // CSF Trailer Axle2 Lift Active
  12781: { name: 'isf_check_engine_on', unit: 'raw' }, // ISF Check Engine On
  12782: { name: 'isf_abs', unit: 'raw' }, // ISF ABS
  12783: { name: 'isf_esp_indicator', unit: 'raw' }, // ISF ESP Indicator
  12784: { name: 'isf_esp', unit: 'raw' }, // ISF ESP
  12785: { name: 'isf_stop', unit: 'raw' }, // ISF STOP
  12786: { name: 'isf_oil_level_indicator_on', unit: 'raw' }, // ISF Oil Level Indicator On
  12787: { name: 'isf_coolant_level_ind', unit: 'raw' }, // ISF Coolant Level Ind
  12788: { name: 'isf_battery_charging_ind', unit: 'raw' }, // ISF Battery Charging Ind
  12789: { name: 'isf_handbrake_system_ind', unit: 'raw' }, // ISF Handbrake System Ind
  12790: { name: 'isf_airbag_ind', unit: 'raw' }, // ISF AIRBAG Ind
  12791: { name: 'isf_eps_ind', unit: 'raw' }, // ISF EPS Ind
  12792: { name: 'isf_warning_ind', unit: 'raw' }, // ISF Warning Ind
  12793: { name: 'isf_light_failure_ind', unit: 'raw' }, // ISF Light Failure Ind
  12794: { name: 'isf_low_tire_press_ind', unit: 'raw' }, // ISF Low Tire Press Ind
  12795: { name: 'isf_wear_of_brake_pads_ind', unit: 'raw' }, // ISF Wear Of Brake Pads Ind
  12796: { name: 'isf_low_fuel_level_ind', unit: 'raw' }, // ISF Low Fuel Level Ind
  12797: { name: 'isf_maintenance_ind', unit: 'raw' }, // ISF Maintenance Ind
  12798: { name: 'isf_glow_plug_ind', unit: 'raw' }, // ISF Glow Plug Ind
  12799: { name: 'isf_fap_ind', unit: 'raw' }, // ISF FAP Ind
  12800: { name: 'isf_epc_ind', unit: 'raw' }, // ISF EPC Ind
  12801: { name: 'isf_engine_oil_filt_plug_ind', unit: 'raw' }, // ISF Engine Oil Filt Plug Ind
  12802: { name: 'isf_low_engine_oil_press_ind', unit: 'raw' }, // ISF Low Engine Oil Press Ind
  12803: { name: 'isf_high_engine_oiltemp_ind', unit: 'raw' }, // ISF High Engine OilTemp Ind
  12804: { name: 'isf_low_coolant_level_ind', unit: 'raw' }, // ISF Low Coolant Level Ind
  12805: { name: 'hydraulic_sys_high_temp_ind', unit: 'raw' }, // Hydraulic Sys High Temp Ind
  12806: { name: 'isf_oil_over_in_hdr_chamb_ind', unit: 'raw' }, // ISF Oil Over In Hdr Chamb Ind
  12807: { name: 'isf_air_filter_is_plugged_ind', unit: 'raw' }, // ISF Air Filter Is Plugged Ind
  12808: { name: 'isf_fuel_filter_is_plugged_ind', unit: 'raw' }, // ISF Fuel Filter Is Plugged Ind
  12809: { name: 'isf_water_in_fuel_ind', unit: 'raw' }, // ISF Water In Fuel Ind
  12810: { name: 'isf_clog_brk_sys_filt_ind', unit: 'raw' }, // ISF Clog Brk Sys Filt Ind
  12811: { name: 'isf_low_washer_fluid_level_ind', unit: 'raw' }, // ISF Low Washer Fluid Level Ind
  12812: { name: 'isf_low_adblue_level_ind', unit: 'raw' }, // ISF Low AdBlue Level Ind
  12813: { name: 'isf_lowtrailer_tyre_press_ind', unit: 'raw' }, // ISF LowTrailer Tyre Press Ind
  12814: { name: 'isf_wear_trail_brk_lining_ind', unit: 'raw' }, // ISF Wear Trail Brk Lining Ind
  12815: { name: 'isf_high_trailer_bk_temp_ind', unit: 'raw' }, // ISF High Trailer Bk Temp Ind
  12816: { name: 'isf_inc_trail_pneum_supp_ind', unit: 'raw' }, // ISF Inc Trail Pneum Supp Ind
  12817: { name: 'isf_low_cng_level_ind', unit: 'raw' }, // ISF Low CNG Level Ind
  12818: { name: 'asf_right_joystick_moved_right', unit: 'raw' }, // ASF Right Joystick Moved Right
  12819: { name: 'asf_right_joystick_moved_left', unit: 'raw' }, // ASF Right Joystick Moved Left
  12820: { name: 'asf_right_joystick_moved_frwd', unit: 'raw' }, // ASF Right Joystick Moved Frwd
  12821: { name: 'asf_right_joystick_moved_back', unit: 'raw' }, // ASF Right Joystick Moved Back
  12822: { name: 'asf_left_joystick_moved_right', unit: 'raw' }, // ASF Left Joystick Moved Right
  12823: { name: 'asf_left_joystick_moved_left', unit: 'raw' }, // ASF Left Joystick Moved Left
  12824: { name: 'asf_left_joystick_moved_frwd', unit: 'raw' }, // ASF Left Joystick Moved Frwd
  12825: { name: 'asf_left_joystick_moved_back', unit: 'raw' }, // ASF Left Joystick Moved Back
  12826: { name: 'asf_first_rear_hydraulic_on', unit: 'raw' }, // ASF First Rear Hydraulic On
  12827: { name: 'asf_second_rear_hydraulic_on', unit: 'raw' }, // ASF Second Rear Hydraulic On
  12828: { name: 'asf_third_rear_hydraulic_on', unit: 'raw' }, // ASF Third Rear Hydraulic On
  12829: { name: 'asf_fourth_rear_hydraulic_on', unit: 'raw' }, // ASF Fourth Rear Hydraulic On
  12830: { name: 'asf_first_front_hydraulic_on', unit: 'raw' }, // ASF First Front Hydraulic On
  12831: { name: 'asf_second_front_hydraulic_on', unit: 'raw' }, // ASF Second Front Hydraulic On
  12832: { name: 'asf_third_front_hydraulic_on', unit: 'raw' }, // ASF Third Front Hydraulic On
  12833: { name: 'asf_fourth_front_hydraulic_on', unit: 'raw' }, // ASF Fourth Front Hydraulic On
  12834: { name: 'asf_front_three_point_hitch_on', unit: 'raw' }, // ASF Front Three Point Hitch On
  12835: { name: 'asf_rear_three_point_hitch_on', unit: 'raw' }, // ASF Rear Three Point Hitch On
  12836: { name: 'asf_front_power_take_offon', unit: 'raw' }, // ASF Front Power Take OffOn
  12837: { name: 'asf_rear_power_take_offon', unit: 'raw' }, // ASF Rear Power Take OffOn
  12838: { name: 'asf_mowing_on', unit: 'raw' }, // ASF Mowing On
  12839: { name: 'asf_threshing_on', unit: 'raw' }, // ASF Threshing On
  12840: { name: 'asf_grain_releas_hopper_on', unit: 'raw' }, // ASF Grain Releas Hopper On
  12841: { name: 'asf_grain_tank_100_proc', unit: 'raw' }, // ASF Grain Tank 100 Proc
  12842: { name: 'asf_grain_tank_70_proc', unit: 'raw' }, // ASF Grain Tank 70 Proc
  12843: { name: 'asf_grain_tank_open', unit: 'raw' }, // ASF Grain Tank Open
  12844: { name: 'asf_unloader_drive_on', unit: 'raw' }, // ASF Unloader Drive On
  12845: { name: 'asf_cleaning_fan_ctrl_on', unit: 'raw' }, // ASF Cleaning Fan Ctrl On
  12846: { name: 'asf_thresh_drum_ctrl_on', unit: 'raw' }, // ASF Thresh Drum Ctrl On
  12847: { name: 'asf_straw_walker_is_clogged', unit: 'raw' }, // ASF Straw Walker Is Clogged
  12848: { name: 'asf_excessive_clearance_normal', unit: 'raw' }, // ASF Excessive Clearance Normal
  12849: { name: 'asf_low_temp_drive_sys_hydr', unit: 'raw' }, // ASF Low Temp Drive Sys Hydr
  12850: { name: 'asf_high_temp_drive_sys_hydr', unit: 'raw' }, // ASF High Temp Drive Sys Hydr
  12851: { name: 'asf_ear_auger_speed_normal', unit: 'raw' }, // ASF Ear Auger Speed Normal
  12852: { name: 'asf_grainaugerspeednormal', unit: 'raw' }, // ASF GrainAugerSpeedNormal
  12853: { name: 'asf_straw_chop_spd_below_norm', unit: 'raw' }, // ASF Straw Chop Spd Below Norm
  12854: { name: 'asf_straw_shak_spd_below_norm', unit: 'raw' }, // ASF Straw Shak Spd Below Norm
  12855: { name: 'asf_feeder_speed_below_norm', unit: 'raw' }, // ASF Feeder Speed Below Norm
  12856: { name: 'asf_straw_chopp_switched_on', unit: 'raw' }, // ASF Straw Chopp Switched On
  12857: { name: 'asf_corn_header_connected', unit: 'raw' }, // ASF Corn Header Connected
  12858: { name: 'asf_grain_header_connected', unit: 'raw' }, // ASF Grain Header Connected
  12859: { name: 'asf_feeder_reverse_on', unit: 'raw' }, // ASF Feeder Reverse On
  12860: { name: 'asf_hydr_pump_prs_flt_clogged', unit: 'raw' }, // ASF Hydr Pump Prs Flt Clogged
  12861: { name: 'asf_adapter_press_filter_sens', unit: 'raw' }, // ASF Adapter Press Filter Sens
  12862: { name: 'asf_service2_required_ind', unit: 'raw' }, // ASF Service2 Required Ind
  12863: { name: 'asf_drain_filter_clogged_ind', unit: 'raw' }, // ASF Drain Filter Clogged Ind
  12864: { name: 'asf_section1_spraying', unit: 'raw' }, // ASF Section1 Spraying
  12865: { name: 'asf_section2_spraying', unit: 'raw' }, // ASF Section2 Spraying
  12866: { name: 'asf_section3_spraying', unit: 'raw' }, // ASF Section3 Spraying
  12867: { name: 'asf_section4_spraying', unit: 'raw' }, // ASF Section4 Spraying
  12868: { name: 'asf_section5_spraying', unit: 'raw' }, // ASF Section5 Spraying
  12869: { name: 'asf_section6_spraying', unit: 'raw' }, // ASF Section6 Spraying
  12870: { name: 'asf_section7_spraying', unit: 'raw' }, // ASF Section7 Spraying
  12871: { name: 'asf_section8_spraying', unit: 'raw' }, // ASF Section8 Spraying
  12872: { name: 'asf_section9_spraying', unit: 'raw' }, // ASF Section9 Spraying
  12873: { name: 'usf_salt_disperser_on', unit: 'raw' }, // USF Salt Disperser On
  12874: { name: 'usf_pouring_chemicals_on', unit: 'raw' }, // USF Pouring Chemicals On
  12875: { name: 'usf_conveyor_belt_on', unit: 'raw' }, // USF Conveyor Belt On
  12876: { name: 'usf_salt_spreader_drv_wheel_on', unit: 'raw' }, // USF Salt Spreader Drv Wheel On
  12877: { name: 'usf_brushes_on', unit: 'raw' }, // USF Brushes On
  12878: { name: 'usf_vacuum_cleaner_on', unit: 'raw' }, // USF Vacuum Cleaner On
  12879: { name: 'usf_water_supply_on', unit: 'raw' }, // USF Water Supply On
  12880: { name: 'usf_karcher_on', unit: 'raw' }, // USF Karcher On
  12881: { name: 'usf_liquid_pump_on', unit: 'raw' }, // USF Liquid Pump On
  12882: { name: 'usf_unloading_hopper_on', unit: 'raw' }, // USF Unloading Hopper On
  12883: { name: 'usf_low_salt_lvl_in_cont_ind', unit: 'raw' }, // USF Low Salt Lvl In Cont Ind
  12884: { name: 'usf_low_water_lvl_in_cont_ind', unit: 'raw' }, // USF Low Water Lvl In Cont Ind
  12885: { name: 'usf_chemicals_on', unit: 'raw' }, // USF Chemicals On
  12886: { name: 'usf_compressor_on', unit: 'raw' }, // USF Compressor On
  12887: { name: 'usf_water_valve_opened', unit: 'raw' }, // USF Water Valve Opened
  12888: { name: 'usf_cabin_moved_up_status', unit: 'raw' }, // USF Cabin Moved Up Status
  12889: { name: 'usf_cabin_moved_down_status', unit: 'raw' }, // USF Cabin Moved Down Status
  12890: { name: 'usf_hydrcs_work_not_permitted', unit: 'raw' }, // USF Hydrcs Work Not Permitted
  12891: { name: 'cisf_section1_presence', unit: 'raw' }, // CiSF Section1 Presence
  12892: { name: 'cisf_section1_filled', unit: 'raw' }, // CiSF Section1 Filled
  12893: { name: 'cisf_section1_overfilled', unit: 'raw' }, // CiSF Section1 Overfilled
  12894: { name: 'cisf_section2_presence', unit: 'raw' }, // CiSF Section2 Presence
  12895: { name: 'cisf_section2_filled', unit: 'raw' }, // CiSF Section2 Filled
  12896: { name: 'cisf_section2_overfilled', unit: 'raw' }, // CiSF Section2 Overfilled
  12897: { name: 'cisf_section3_presence', unit: 'raw' }, // CiSF Section3 Presence
  12898: { name: 'cisf_section3_filled', unit: 'raw' }, // CiSF Section3 Filled
  12899: { name: 'cisf_section3_overfilled', unit: 'raw' }, // CiSF Section3 Overfilled
  12900: { name: 'cisf_section4_presence', unit: 'raw' }, // CiSF Section4 Presence
  12901: { name: 'cisf_section4_filled', unit: 'raw' }, // CiSF Section4 Filled
  12902: { name: 'cisf_section4_overfilled', unit: 'raw' }, // CiSF Section4 Overfilled
  12903: { name: 'cisf_section5_presence', unit: 'raw' }, // CiSF Section5 Presence
  12904: { name: 'cisf_section5_filled', unit: 'raw' }, // CiSF Section5 Filled
  12905: { name: 'cisf_section5_overfilled', unit: 'raw' }, // CiSF Section5 Overfilled
  12906: { name: 'cisf_section6_presence', unit: 'raw' }, // CiSF Section6 Presence
  12907: { name: 'cisf_section6_filled', unit: 'raw' }, // CiSF Section6 Filled
  12908: { name: 'cisf_section6_overfilled', unit: 'raw' }, // CiSF Section6 Overfilled
  12909: { name: 'cisf_section7_presence', unit: 'raw' }, // CiSF Section7 Presence
  12910: { name: 'cisf_section7_filled', unit: 'raw' }, // CiSF Section7 Filled
  12911: { name: 'cisf_section7_overfilled', unit: 'raw' }, // CiSF Section7 Overfilled
  12912: { name: 'cisf_section8_presence', unit: 'raw' }, // CiSF Section8 Presence
  12913: { name: 'cisf_section8_filled', unit: 'raw' }, // CiSF Section8 Filled
  12914: { name: 'cisf_section8_overfilled', unit: 'raw' }, // CiSF Section8 Overfilled
  12915: { name: 'drive_r_front_r_door_opened', unit: 'raw' }, // Drive R Front R Door Opened
  12916: { name: 'isf_hyd_sys_oil_filt_plugg_ind', unit: 'raw' }, // ISF Hyd Sys Oil Filt Plugg Ind
  12917: { name: 'isf_hydr_sys_low_press_ind', unit: 'raw' }, // ISF Hydr Sys Low Press Ind
  12918: { name: 'isf_hydr_oil_low_level_ind', unit: 'raw' }, // ISF Hydr Oil Low Level Ind
  12919: { name: 'ssf_trunk_door_open_factr_rem', unit: 'raw' }, // SSF Trunk Door Open Factr Rem
  12920: { name: 'agricultural_state_flags_p4', unit: 'raw' }, // Agricultural State Flags P4
  12921: { name: 'utility_state_flags_p4', unit: 'raw' }, // Utility State Flags P4
  12922: { name: 'cistern_state_flags_p4', unit: 'raw' }, // Cistern State Flags P4
  13200: { name: 'no_sim_counter', unit: 'raw' }, // No SIM Counter
  13259: { name: 'tell_tale_4', unit: 'raw' }, // Tell Tale 4
  13260: { name: 'vehicle_load_type_info', unit: 'enum', values: { 0: 'undefined_load_type', 1: 'goods', 2: 'passengers' } }, // Vehicle load type info
  13261: { name: 'driver1_load_unload_time', unit: 's' }, // Driver1 load/unload time
  13262: { name: 'driver2_load_unload_time', unit: 's' }, // Driver2 load/unload time
  13263: { name: 'drivers_private_data_consent', unit: 'raw' }, // Drivers private data consent
  124451: { name: 'auxil_ext_valve_number_9', unit: '%' }, // Auxil ext valve number 9
};

function resolveIo(id, rawValue) {
  const def = IO_NAMES[id];
  if (!def) return { id, raw: rawValue };

  if (def.unit === 'accel_xyz') {
    const big = BigInt(rawValue);
    const x = Number((big >> 32n) & 0xFFFFn);
    const y = Number((big >> 16n) & 0xFFFFn);
    const z = Number(big & 0xFFFFn);
    return { name: def.name, value: { x, y, z }, unit: 'mg' };
  }

  if (def.unit === 'ascii8' || def.unit === 'ascii1') {
    const numBytes = def.unit === 'ascii8' ? 8 : 1;
    const hex = BigInt(rawValue).toString(16).padStart(numBytes * 2, '0');
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.slice(i, i + 2), 16);
      if (byte > 0) str += String.fromCharCode(byte);
    }
    return { name: def.name, value: str };
  }

  let value = rawValue;
  if (def.scale) value = +(rawValue * def.scale).toFixed(3);
  if (def.unit === 'bool') value = rawValue === 1 ? true : false;
  if (def.unit === 'enum') value = def.values[rawValue] ?? rawValue;

  const result = { name: def.name, value };
  if (def.unitLabel) result.unit = def.unitLabel;
  else if (!['bool', 'enum', 'raw', 'accel_xyz'].includes(def.unit)) result.unit = def.unit;
  return result;
}

function parseImei(buf) {
  if (buf.length < 2) return null;
  const len = buf.readUInt16BE(0);
  if (buf.length < 2 + len) return null;
  return buf.slice(2, 2 + len).toString('ascii');
}

function crc16(buf) {
  let crc = 0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0xA001;
      else crc >>>= 1;
    }
  }
  return crc;
}

function parseGps(buf, offset) {
  const longitude = buf.readInt32BE(offset) / 10000000;
  const latitude = buf.readInt32BE(offset + 4) / 10000000;
  const altitude = buf.readInt16BE(offset + 8);
  const angle = buf.readUInt16BE(offset + 10);
  const satellites = buf.readUInt8(offset + 12);
  const speed = buf.readUInt16BE(offset + 13);
  return { longitude, latitude, altitude, angle, satellites, speed };
}

function parseIoCodec8(buf, offset) {
  const eventId = buf.readUInt8(offset);
  const totalCount = buf.readUInt8(offset + 1);
  let pos = offset + 2;
  const io = { eventId, elements: {} };

  for (const [size, readFn] of [
    [1, 'readUInt8'],
    [2, 'readUInt16BE'],
    [4, 'readUInt32BE'],
    [8, null],
  ]) {
    const count = buf.readUInt8(pos++);
    for (let i = 0; i < count; i++) {
      const id = buf.readUInt8(pos); pos += 1;
      let value;
      if (size === 8) {
        value = buf.readBigUInt64BE(pos).toString();
        pos += 8;
      } else {
        value = buf[readFn](pos);
        pos += size;
      }
      io.elements[id] = value;
    }
  }

  return { io, nextOffset: pos };
}

function parseIoCodec8E(buf, offset) {
  const eventId = buf.readUInt16BE(offset);
  const totalCount = buf.readUInt16BE(offset + 2);
  let pos = offset + 4;
  const io = { eventId, elements: {} };

  for (const size of [1, 2, 4, 8]) {
    const count = buf.readUInt16BE(pos); pos += 2;
    for (let i = 0; i < count; i++) {
      const id = buf.readUInt16BE(pos); pos += 2;
      let value;
      if (size === 8) {
        value = buf.readBigUInt64BE(pos).toString();
      } else if (size === 4) {
        value = buf.readUInt32BE(pos);
      } else if (size === 2) {
        value = buf.readUInt16BE(pos);
      } else {
        value = buf.readUInt8(pos);
      }
      pos += size;
      io.elements[id] = value;
    }
  }

  // variable length elements (Codec 8E only)
  const varCount = buf.readUInt16BE(pos); pos += 2;
  for (let i = 0; i < varCount; i++) {
    const id = buf.readUInt16BE(pos); pos += 2;
    const len = buf.readUInt16BE(pos); pos += 2;
    io.elements[id] = buf.slice(pos, pos + len).toString('hex');
    pos += len;
  }

  return { io, nextOffset: pos };
}

function parseAvlPacket(buf) {
  if (buf.length < 12) return null;

  const preamble = buf.readUInt32BE(0);
  if (preamble !== 0x00000000) return null;

  const dataLength = buf.readUInt32BE(4);
  const codecId = buf.readUInt8(8);
  const recordCount = buf.readUInt8(9);

  if (codecId !== CODEC_8 && codecId !== CODEC_8E) {
    return { error: `Unsupported codec: 0x${codecId.toString(16)}`, codecId };
  }

  // CRC check: covers from codec ID through Number of Data 2
  // Packet layout: [4 preamble][4 dataLength][dataLength bytes][4 CRC]
  const crcData = buf.slice(8, 8 + dataLength);
  const crcReceived = buf.readUInt32BE(8 + dataLength);
  const crcCalculated = crc16(crcData);

  const records = [];
  let pos = 10;

  for (let i = 0; i < recordCount; i++) {
    const timestamp = new Date(Number(buf.readBigUInt64BE(pos))).toISOString();
    pos += 8;
    const priority = buf.readUInt8(pos++);
    const gps = parseGps(buf, pos);
    pos += 15;

    let io, nextOffset;
    if (codecId === CODEC_8) {
      ({ io, nextOffset } = parseIoCodec8(buf, pos));
    } else {
      ({ io, nextOffset } = parseIoCodec8E(buf, pos));
    }
    pos = nextOffset;

    // Resolve IO elements to human-readable names
    const ioResolved = {};
    const ioUnknown = {};
    for (const [id, val] of Object.entries(io.elements)) {
      const resolved = resolveIo(Number(id), val);
      if (resolved.name) {
        ioResolved[resolved.name] = resolved.unit
          ? { value: resolved.value, unit: resolved.unit }
          : resolved.value;
      } else {
        ioUnknown[`io_${id}`] = val;
      }
    }

    records.push({
      timestamp,
      priority,
      gps: {
        lat: gps.latitude,
        lon: gps.longitude,
        altitude: gps.altitude,
        angle: gps.angle,
        speed_kmh: gps.speed,
        satellites: gps.satellites,
      },
      io: ioResolved,
      io_unknown: Object.keys(ioUnknown).length ? ioUnknown : undefined,
      io_event_id: io.eventId,
    });
  }

  return {
    codecId: `0x${codecId.toString(16)}`,
    recordCount,
    crcOk: crcCalculated === crcReceived,
    records,
  };
}

module.exports = { parseImei, parseAvlPacket };
