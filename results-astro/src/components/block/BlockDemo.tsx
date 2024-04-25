import type { BlockDefinition } from "@/lib/blocks/typings";

export default function BlockDemo({ block, index }: { block: BlockDefinition, index?: number }) {
    return <div>
        <div>{JSON.stringify(block, null, 2)}</div>
    </div>
}