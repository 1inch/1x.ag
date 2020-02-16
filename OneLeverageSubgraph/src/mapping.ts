import { BigInt, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import { ClosePosition as ClosePositionEvent, OpenPosition as OpenPositionEvent } from '../generated/Contract/Contract';
import { Positions } from '../generated/schema';

function padHex(hex: string, length: i32): string {
    if (hex.startsWith('0x')) {
        hex = hex.substr(2);
    }
    return hex.padStart(length, '0');
}

function hashOfPosition(
    contract: Bytes,
    owner: Bytes
): ByteArray {
    return crypto.keccak256(
        ByteArray.fromHexString(
            padHex(contract.toHex(), 40) +
            padHex(owner.toHex(), 40)
        )
    );
}

export function handleOpenPosition(event: OpenPositionEvent): void {
    let entity_id = hashOfPosition(
        event.params.address,
        event.params.owner
    ).toHex();

    let entity = Positions.load(entity_id);

    if (entity == null) {
        entity = new Positions(entity_id);

        entity.contract = event.params.address;
        entity.owner = event.params.owner;
        entity.amount = event.params.amount;
        entity.stopLoss = event.params.stopLoss;
        entity.takeProfit = event.params.takeProfit;
    }

    entity.save();
}

export function handleClosePosition(event: ClosePositionEvent): void {
    let entity_id = hashOfPosition(
        event.params.address,
        event.params.owner
    ).toHex();

    let entity = Positions.load(entity_id);

    if (entity == null) {
        entity = new Positions(entity_id);
        entity.closed = true;
    }

    entity.save();
}
