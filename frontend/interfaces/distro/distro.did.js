export const idlFactory = ({ IDL }) => {
  const ManualReply = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const ManualReply_1 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  return IDL.Service({
    'addCycles' : IDL.Func([IDL.Int], [ManualReply], []),
    'getCanisterStatus' : IDL.Func([], [ManualReply_1], []),
  });
};
export const init = ({ IDL }) => { return []; };
