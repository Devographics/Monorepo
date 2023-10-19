import styled from 'styled-components'
import T from 'core/i18n/T'
import React from 'react'
import { useTheme } from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import { TableData } from 'core/helpers/datatables'
import round from 'lodash/round.js'

const Tables = ({ tables = [] }: { tables: TableData[] }) => {
    return (
        <TablesWrapper>
            {tables.map((table, i) => (
                <Table key={i} {...table} />
            ))}
        </TablesWrapper>
    )
}

const Table = (table: TableData) => {
    const { title, headings, rows, years } = table
    return (
        <TableWrapper>
            {title && <Title>{title}</Title>}
            <DataTable>
                <thead>
                    <tr>
                        {headings.map((heading, i) => (
                            <TableHeading
                                key={i}
                                {...heading}
                                years={years}
                                colSpan={i > 0 && years && years.length > 0 ? years.length : 1}
                            />
                        ))}
                    </tr>
                    {years && (
                        <tr>
                            <TH_>
                                <T k="table.year" />
                            </TH_>
                            {[...Array(headings.length - 1)].map((heading, i) =>
                                years.map(year => <TH_ key={year}>{year}</TH_>)
                            )}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <TableRow row={row} key={i} />
                    ))}
                </tbody>
            </DataTable>
        </TableWrapper>
    )
}

const TableHeading = ({ id, colSpan, labelId }) => (
    <TH_ scope="col" id={id} colSpan={colSpan}>
        <T useShort={true} k={labelId} />
    </TH_>
)

const TH_ = styled.th`
    background: ${props => props.theme.colors.backgroundAlt};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 25ch;
`

const TableRow = ({ row }) => (
    <tr>
        {row.map((cell, index) => {
            return index === 0 ? (
                <TH_ key={index} scope="row">
                    {cell.label ? (
                        <span dangerouslySetInnerHTML={{ __html: cell.label }} />
                    ) : (
                        <T k={cell.labelId} useShort={true} html={true} />
                    )}
                </TH_>
            ) : Array.isArray(cell.value) ? (
                cell.value.map(yearValue => (
                    <TableCell key={yearValue.year} {...cell} {...yearValue} />
                ))
            ) : (
                <TableCell key={index} {...cell} />
            )
        })}
    </tr>
)

const TableCell = ({ value, isPercentage }) => (
    <td>
        {round(value, 1).toString()}
        {typeof value !== 'undefined' && isPercentage && '%'}
    </td>
)

const TablesWrapper = styled.div`
    max-height: 450px;
    overflow-y: auto;
    margin-bottom: 2rem;
    /* box-shadow: inset 0px 0px 5px 5px rgba(0, 0, 0, 0.25); */
`

const TableWrapper = styled.div`
    margin-bottom: ${spacing(2)};
    &:last-of-type {
        margin-bottom: 0;
    }
`

const DataTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    th {
        text-align: left;
    }

    td,
    th {
        padding: 0.75rem 0.45rem;
        border: 1px solid ${({ theme }) => theme.colors.border};
        margin: 0;
        font-size: ${fontSize('small')};
    }
`

const Title = styled.h4`
    margin-bottom: ${spacing(0.5)};
`

export default Tables
