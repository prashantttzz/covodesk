import {atomWithStorage} from "jotai/utils";
import {Doc} from "@workspace/backend/_generated/dataModel";
import { STATUS_FILTER_KEY } from "@/constants";

export const statusfilteratom =atomWithStorage<Doc<"conversations">["status"]|"all">(STATUS_FILTER_KEY ,"all")