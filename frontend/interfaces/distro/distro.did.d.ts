import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ManualReply = { 'Ok' : boolean } |
  { 'Err' : string };
export type ManualReply_1 = { 'Ok' : string } |
  { 'Err' : string };
export interface _SERVICE {
  'addCycles' : ActorMethod<[bigint], ManualReply>,
  'addCyclesToAll' : ActorMethod<[bigint], string>,
  'getCanisterStatus' : ActorMethod<[], ManualReply_1>,
}
