import { BigInt, Bytes, ByteArray, crypto } from "@graphprotocol/graph-ts"
import {
    Contract,
    OpenPosition as OpenPositionEvent,
    ClosePosition as ClosePositionEvent
} from "../generated/Contract/Contract"
import { OpenPosition, ClosePosition } from "../generated/schema"

function padHex(hex: string, length: i32): string {
    if (hex.startsWith('0x')) {
        hex = hex.substr(2);
    }
    return hex.padStart(length, '0');
}

function hashOfOpenPosition(
    owner: Bytes,
    amount: BigInt,
    liquidationAmountMin: BigInt,
    liquidationAmountMax: BigInt,
    blockNumber: BigInt,
): ByteArray {
    return crypto.keccak256(
        ByteArray.fromHexString(
            padHex(owner.toHex(), 40) +
            padHex(amount.toHex().substr(2), 64) +
            padHex(liquidationAmountMin.toHex().substr(2), 64) +
            padHex(liquidationAmountMax.toHex().substr(2), 64) +
            padHex(blockNumber.toHex().substr(2), 64)
        )
    );
}

function hashOfClosePosition(
    owner: Bytes,
    blockNumber: BigInt,
): ByteArray {
    return crypto.keccak256(
        ByteArray.fromHexString(
            padHex(owner.toHex(), 40) +
            padHex(blockNumber.toHex().substr(2), 64)
        )
    );
}

export function handleOpenPosition(event: OpenPositionEvent): void {
    let entity_id = hashOfOpenPosition(
        event.params.owner,
        event.params.amount,
        event.params.liquidationAmountMin,
        event.params.liquidationAmountMax,
        event.block.number
    ).toHex();

    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = OpenPosition.load(entity_id);

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity == null) {
        entity = new OpenPosition(entity_id);

        // Entity fields can be set using simple assignments
        // entity.updatesCount = BigInt.fromI32(0)

        // Entity fields can be set based on event parameters
        entity.owner = event.params.owner;
        entity.amount = event.params.amount;
        entity.liquidationAmountMin = event.params.liquidationAmountMin;
        entity.liquidationAmountMax = event.params.liquidationAmountMax;
    }

    // Entities can be written to the store with `.save()`
    entity.save()
}

export function handleClosePosition(event: ClosePositionEvent): void {
    let entity_id = hashOfClosePosition(
        event.params.owner,
        event.block.number
    ).toHex();

    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = ClosePosition.load(entity_id);

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity == null) {
        entity = new ClosePosition(entity_id);

        // Entity fields can be set using simple assignments
        // entity.updatesCount = BigInt.fromI32(0)

        // Entity fields can be set based on event parameters
        entity.owner = event.params.owner;
    }

    // Entities can be written to the store with `.save()`
    entity.save()
}
