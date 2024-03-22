import { Json, OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';



async function getJson() {
  try {
    const response = await fetch(
      "https://ec2-52-12-71-27.us-west-2.compute.amazonaws.com:3000"
    );  
    return response.json();
  } catch (error) {
    console.log("Error Happened");
    return {
      error: error,
    };
  }
}

async function storeEnrollment(enrollment: any) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: enrollment },
  });
}

async function retrieveAccount() {
  const data = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  return data
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    case 'createAccount':
      const enrollment = await getJson();
      await storeEnrollment(enrollment);
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([text(JSON.stringify(enrollment))]),
        },
      });
    case 'retrieveAccount':
      const account: Record<string, Json> | null =  await retrieveAccount();
      if (account) {
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([text(JSON.stringify(account["enrollmentCert"]))]),
          },
        });
      }
    default:
      throw new Error('Method not found.');
  }
};
