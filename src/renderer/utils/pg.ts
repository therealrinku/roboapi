export const pgDataTypes = {
  // Simple types
  16: 'boolean', // BOOLEAN
  20: 'bigint', // BIGINT
  21: 'smallint', // SMALLINT
  23: 'integer', // INTEGER
  25: 'text', // TEXT
  1043: 'varchar', // VARCHAR
  1042: 'char', // CHAR
  1082: 'date', // DATE
  1114: 'timestamp', // TIMESTAMP
  701: 'double precision', // DOUBLE PRECISION
  1700: 'numeric', // NUMERIC
  2950: 'uuid', // UUID
  1083: 'time', // TIME
  1184: 'interval', // INTERVAL
  1080: 'point', // POINT
  600: 'circle', // CIRCLE
  1000: 'array', // ARRAY (Generic)
  1009: 'jsonb',

  // JSON types
  114: 'json', // JSON
  3802: 'jsonb', // JSONB

  // Other date/time types
  1115: 'timestamptz', // TIMESTAMPTZ (Timestamp with Time Zone)
  1186: 'date_range', // DATERANGE
  1187: 'int4range', // INT4RANGE (Range of integers)
  1188: 'numrange', // NUMRANGE (Range of numbers)
  1189: 'tsrange', // TSRANGE (Range of timestamps without time zone)
  1190: 'tstzrange', // TSTZRANGE (Range of timestamps with time zone)

  // Geometric types
  601: 'line', // LINE
  602: 'lseg', // LSEG (Line segment)
  603: 'box', // BOX
  604: 'path', // PATH
  651: 'polygon', // POLYGON
  718: 'circle', // CIRCLE

  // Range types
  3904: 'int8range', // INT8RANGE (Range of big integers)
  3906: 'numrange', // NUMRANGE (Range of numbers)
  3908: 'tsrange', // TSRANGE (Range of timestamps without time zone)
  3910: 'tstzrange', // TSTZRANGE (Range of timestamps with time zone)
  3903: 'daterange', // DATERANGE (Range of dates)

  // Network address types
  1041: 'cidr', // CIDR (IPv4/IPv6 network)
  1040: 'inet', // INET (IPv4/IPv6 address)
  803: 'macaddr', // MACADDR (MAC address)

  // Monetary types
  790: 'money', // MONEY

  // Full-text search
  3614: 'tsvector', // TSVECTOR (Full-text search vector)
  3615: 'tsquery', // TSQUERY (Full-text search query)

  // Object and array types
  1001: 'int4array', // INT4ARRAY (Array of integers)
  1007: 'textarray', // TEXTARRAY (Array of text)
  1016: 'bytea', // BYTEA (Array of bytea)
  1012: 'oid', // OID (Object identifier)
  1028: 'int8array', // INT8ARRAY (Array of BIGINT)

  // System types
  26: 'oid', // OID (Object identifier)
  27: 'regproc', // REGPROC (Function)
  28: 'regtype', // REGTYPE (Data type)
  29: 'regrole', // REGROLE (Role)
  2906: 'pg_lsn', // Log Sequence Number (LSN)
  194: 'pg_snapshot', // Snapshot
  2316: 'pg_catalog', // pg_catalog schema

  // Foreign Data Wrappers (FDW) and Extensions
  3734: 'fdw', // Foreign Data Wrappers
  3075: 'pg_fdw', // PostgreSQL FDW

  // Composite Types (Custom)
  2249: 'composite', // Composite Types (custom)

  // Custom Types (User-Defined)
  // These types are generally mapped to an OID depending on the user-defined type
  0: 'custom_type', // Placeholder for custom types (User-defined)
};
