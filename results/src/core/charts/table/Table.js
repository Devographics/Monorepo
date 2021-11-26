import styled from 'styled-components'
import T from 'core/i18n/T'
import React from 'react'
import { useTheme } from 'styled-components'
import { fontSize } from 'core/theme'

const Tables = ({ tables = [] }) => {
    return (
        <TableWrapper>
            {tables.map((table) => {
                return (
                    <>
                        {table.title && <Title>{table.title}</Title>}
                        <Table {...table} />
                    </>
                )
            })}
        </TableWrapper>
    )
}

const Table = ({ headings, rows, years }) => (
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
                    <TH>
                        <T k="table.year" />
                    </TH>
                    {[...Array(headings.length - 1)].map((heading, i) =>
                        years.map((year) => <TH key={year}>{year}</TH>)
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
)

const TableHeading = ({ id, colSpan, labelId }) => (
    <TH scope="col" id={id} colSpan={colSpan}>
        <T k={labelId} />
    </TH>
)

const TH = styled.th`
    background: ${(props) => props.theme.colors.backgroundAlt};
`

const TableRow = ({ row }) => (
    <tr>
        {row.map((cell, index) => {
            return index === 0 ? (
                <TH key={index} scope="row">
                    {cell.label ?? <T k={cell.labelId} />}
                </TH>
            ) : Array.isArray(cell.value) ? (
                cell.value.map((yearValue) => (
                    <TableCell key={yearValue.value} {...cell} {...yearValue} />
                ))
            ) : (
                <TableCell {...cell} />
            )
        })}
    </tr>
)

const TableCell = ({ value, isPercentage }) => (
    <td>
        {value}
        {isPercentage && '%'}
    </td>
)

const TableWrapper = styled.div`
    max-height: 450px;
    overflow-y: auto;
    margin-bottom: 2rem;
    box-shadow: inset 0px 0px 5px 5px rgba(0, 0, 0, 0.25);
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
    margin-bottom: 0.25rem;
`

export default Tables
