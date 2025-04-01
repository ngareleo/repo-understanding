/**
 * ---------------------------------------------------------
 * Alternative entry point.
 *
 * Good for sanity checks when you don't want to write tests
 *
 * (Save tokens[Save the Planet 🌍])
 *
 * ---------------------------------------------------------
 *
 */
import { get_file_structure } from "./tools.js";

console.log(await get_file_structure("sample/control-tower"));
