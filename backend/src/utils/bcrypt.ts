import bcrypt from "bcrypt";

export const hashValue = async (value: string, salt = 10): Promise<string> => await bcrypt.hash(value, salt);

export const compareValue = async (value: string, hashValue: string) => await bcrypt.compare(value, hashValue);
