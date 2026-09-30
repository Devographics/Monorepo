import './Correlations.scss'
import React, { useEffect, useMemo, useState } from 'react'
import { CorrelationItem, Correlations } from '@devographics/types'
import Loading from 'core/components/Loading'
import { getQuestionById } from 'core/helpers/options'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import { CorrelationsContent } from './CorrelationsContent'
import { fetchCorrelations, getLoadedCorrelations } from './helpers'

/*

Explore correlations by following them: start from one question, then click any
correlation card to make the question it points to the new base question, and
look at its correlations in turn. A back button retraces the path.

Correlations are read from the page data when the question happens to be loaded
there (see getLoadedCorrelations). Otherwise only that question's correlations
are fetched from the API (see fetchCorrelations), a small query, and kept for
the rest of the session so revisiting a question is instant.

A card pointing to one specific answer ("Gender > Man") makes that answer the
base, and shows the correlations of that answer; a card pointing to a question
as a whole or to its number of selected answers shows the question's own.

*/

type FetchState =
    | { status: 'loading' }
    | { status: 'done'; correlations?: Correlations }
    | { status: 'error'; error: any }

type ExplorerTarget = {
    questionId: string
    // set when the base is one specific answer of the question
    optionId?: string
}

const getTarget = ({ kind2, questionId2, optionId2 }: CorrelationItem): ExplorerTarget => ({
    questionId: questionId2,
    optionId: kind2 === 'option' ? optionId2 : undefined
})

const isSameTarget = (a: ExplorerTarget, b: ExplorerTarget) =>
    a.questionId === b.questionId && a.optionId === b.optionId

export const CorrelationsExplorer = ({
    initialQuestionId = 'age'
}: {
    // question to start from
    initialQuestionId?: string
}) => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext

    // every base question visited so far; the last one is the current one
    const [trail, setTrail] = useState<ExplorerTarget[]>([{ questionId: initialQuestionId }])
    const current = trail[trail.length - 1]
    const { questionId, optionId } = current

    const swap = (correlation: CorrelationItem) => {
        const target = getTarget(correlation)
        setTrail(trail =>
            isSameTarget(trail[trail.length - 1], target) ? trail : [...trail, target]
        )
    }
    const goBack = () => setTrail(trail => trail.slice(0, -1))

    const question = getQuestionById(currentEdition, questionId)

    // correlations fetched for questions that weren't loaded with the page,
    // by question id
    const [fetched, setFetched] = useState<Record<string, FetchState>>({})
    const loadedCorrelations = question && getLoadedCorrelations({ pageContext, question })
    const needsFetch = !!question && !loadedCorrelations && !fetched[questionId]

    useEffect(() => {
        if (!question || !needsFetch) {
            return
        }
        setFetched(fetched => ({ ...fetched, [questionId]: { status: 'loading' } }))
        fetchCorrelations({ pageContext, question }).then(({ correlations, error }) => {
            setFetched(fetched => ({
                ...fetched,
                [questionId]: error ? { status: 'error', error } : { status: 'done', correlations }
            }))
        })
        // only re-run when the base question changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId])

    // the correlation components expect a block, mainly to title the question:
    // describe the current question as one
    const block = useMemo(
        () =>
            question &&
            ({ id: question.id, sectionId: question.section.id } as BlockVariantDefinition),
        [question]
    )

    let content
    if (!question || !block) {
        content = (
            <p className="correlations-explorer-message">
                Could not find question <code>{questionId}</code>
            </p>
        )
    } else {
        const fetchState = fetched[questionId]
        const loaded =
            loadedCorrelations ||
            (fetchState?.status === 'done' ? fetchState.correlations : undefined)
        const isLoading = needsFetch || fetchState?.status === 'loading'
        const correlations = optionId
            ? loaded?.optionCorrelations?.find(group => group.id === optionId)?.correlations
            : loaded?.questionCorrelations
        content = isLoading ? (
            <Loading />
        ) : fetchState?.status === 'error' ? (
            <p className="correlations-explorer-message">
                Could not load correlations for <code>{questionId}</code>:{' '}
                {String(fetchState.error?.message ?? fetchState.error)}
            </p>
        ) : correlations && correlations.length > 0 ? (
            <CorrelationsContent
                // start each question with fresh hover/expanded state
                key={`${questionId}__${optionId}`}
                question={question}
                block={block}
                optionId={optionId}
                type={optionId ? 'option' : 'question'}
                correlations={correlations}
                enableSwap={true}
                onSwap={swap}
            />
        ) : (
            <p className="correlations-explorer-message">
                No correlations found for <code>{questionId}</code>
                {optionId && (
                    <>
                        {' '}
                        (<code>{optionId}</code>)
                    </>
                )}
                .
            </p>
        )
    }

    return (
        <div className="correlations-explorer">
            {trail.length > 1 && (
                <button className="correlations-explorer-back" onClick={goBack}>
                    <T k="general.back" />
                </button>
            )}
            {content}
        </div>
    )
}

export default CorrelationsExplorer
