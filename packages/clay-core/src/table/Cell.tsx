/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Button from '@clayui/button';
import Icon from '@clayui/icon';
import Layout from '@clayui/layout';
import LoadingIndicator from '@clayui/loading-indicator';
import {Keys} from '@clayui/shared';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import {useFocusWithin} from '../aria';
import {Scope, useScope} from './ScopeContext';
import {useRow, useTable} from './context';

type Props = {
	/**
	 * Aligns the text inside the Cell.
	 */
	align?: 'center' | 'left' | 'right';

	/**
	 * Children content to render content.
	 */
	children: React.ReactNode;

	/**
	 * Sometimes we are unable to remove specific table columns from the DOM
	 * and need to hide it using CSS. This property can be added to the "new"
	 * first or last cell to maintain table styles on the left and right side.
	 */
	delimiter?: 'start' | 'end';

	/**
	 * Fills out the remaining space inside a Cell.
	 */
	expanded?: boolean;

	/**
	 * Internal property.
	 * @ignore
	 */
	index?: number;

	/**
	 * Internal property.
	 * @ignore
	 */
	keyValue?: React.Key;

	/**
	 * Whether the column allows sortable. Only available in the header column.
	 */
	sortable?: boolean;

	/**
	 * Aligns horizontally contents inside the Cell.
	 */
	textAlign?: 'center' | 'end' | 'start';

	/**
	 * Truncates the text inside a Cell.
	 */
	truncate?: boolean;

	/*
	 * Break the text into lines when necessary.
	 */
	wrap?: boolean;

	/**
	 * Sets the column width.
	 */
	width?: string;

	/**
	 * Sets a text value if the component's content is not plain text.
	 */
	textValue?: string;
} & React.ThHTMLAttributes<HTMLTableCellElement> &
	React.TdHTMLAttributes<HTMLTableCellElement>;

export const Cell = React.forwardRef<HTMLTableCellElement, Props>(
	function CellInner(
		{
			align,
			children,
			className,
			delimiter,
			expanded,
			index,
			keyValue,
			sortable,
			textAlign,
			textValue,
			truncate,
			width = 'auto',
			wrap = true,
			...otherProps
		},
		ref
	) {
		const {
			columnsVisibility,
			expandedKeys,
			headCellsCount,
			messages,
			onExpandedChange,
			onSortChange,
			sort,
			sortDescriptionId,
			treegrid,
		} = useTable();

		const [isFocused, setIsFocused] = useState(false);

		const focusWithinProps = useFocusWithin({
			disabled: !treegrid,
			id: keyValue!,
			onFocusChange: setIsFocused,
		});
		const scope = useScope();
		const {divider, expandable, isLoading, key, lazy, level, loadMore} =
			useRow();

		const isHead = scope === Scope.Head;
		const As = isHead ? 'th' : 'td';

		const childrenCount = React.Children.count(children);

		const toggle = useCallback(
			(key: React.Key) => {
				const newExpandedKeys = new Set(expandedKeys);

				if (newExpandedKeys.has(key)) {
					newExpandedKeys.delete(key);
				} else {
					newExpandedKeys.add(key);
				}

				onExpandedChange(newExpandedKeys);
			},
			[expandedKeys, onExpandedChange]
		);

		return (
			<As
				{...otherProps}
				{...focusWithinProps}
				aria-colindex={isHead && !sortable ? undefined : index! + 1}
				aria-describedby={
					isHead && sortable ? sortDescriptionId : undefined
				}
				aria-sort={
					isHead && sortable
						? sort && keyValue === sort.column
							? sort.direction
							: 'none'
						: undefined
				}
				className={classNames(className, {
					'table-cell-expand': truncate || expanded,
					[`table-cell-${delimiter}`]: delimiter,
					[`table-column-text-${textAlign}`]: textAlign,
					[`text-${align}`]: align,
					'table-cell-ws-nowrap': !wrap,
					'table-focus': focusWithinProps.tabIndex === 0 && isFocused,
					'table-head-title': isHead,
				})}
				colSpan={
					divider
						? headCellsCount + (columnsVisibility ? 1 : 0)
						: undefined
				}
				data-id={
					typeof keyValue === 'number'
						? `number,${keyValue}`
						: `string,${keyValue}`
				}
				onClick={(event) => {
					if (!(isHead && sortable)) {
						return;
					}

					event.preventDefault();
					onSortChange(
						{
							column: keyValue!,
							direction:
								sort && keyValue === sort.column
									? sort.direction === 'ascending'
										? 'descending'
										: 'ascending'
									: 'ascending',
						},
						textValue!
					);
				}}
				onKeyDown={(event) => {
					if (event.key === Keys.Enter) {
						toggle(key!);
					}
				}}
				ref={ref}
				role={treegrid ? 'gridcell' : undefined}
				style={{
					width,
				}}
			>
				{isHead && sortable ? (
					<a
						className="inline-item text-truncate-inline"
						href="#"
						onClick={(event) => event.preventDefault()}
						role="presentation"
						tabIndex={treegrid ? -1 : undefined}
					>
						<span className="text-truncate">{children}</span>

						{sort && keyValue === sort.column && (
							<span className="inline-item inline-item-after">
								<Icon
									symbol={
										sort.direction === 'ascending'
											? 'order-arrow-up'
											: 'order-arrow-down'
									}
								/>
							</span>
						)}
					</a>
				) : truncate ? (
					<span className="text-truncate-inline">
						<span className="text-truncate">{children}</span>
					</span>
				) : treegrid && index === 0 && !isHead ? (
					<Layout.ContentRow
						style={{
							paddingLeft:
								(level - (expandable || lazy ? 1 : 0)) * 28 -
								(expandable || lazy ? 4 : 0),
						}}
					>
						{(expandable || lazy) && !isLoading && (
							<Layout.ContentCol className="autofit-col-toggle">
								<Button
									aria-label={messages['expandable']}
									borderless
									displayType="secondary"
									monospaced
									onClick={() => {
										if (expandable) {
											toggle(key);
										} else {
											loadMore();
										}
									}}
									size="xs"
									tabIndex={-1}
								>
									<Icon
										symbol={
											expandedKeys.has(key)
												? 'angle-down'
												: 'angle-right'
										}
									/>
								</Button>
							</Layout.ContentCol>
						)}

						{isLoading && (
							<Layout.ContentCol className="autofit-col-toggle">
								<div className="btn-monospaced btn-xs">
									<LoadingIndicator size="sm" />
								</div>
							</Layout.ContentCol>
						)}

						{React.Children.map(children, (child, index) => {
							if (!child) {
								return null;
							}

							return (
								<Layout.ContentCol
									className={classNames({
										'autofit-col-checkbox':
											React.isValidElement(child) &&
											// @ts-ignore
											child?.type.displayName ===
												'ClayIcon',
									})}
									expand={index === childrenCount - 1}
								>
									{child}
								</Layout.ContentCol>
							);
						})}
					</Layout.ContentRow>
				) : (
					children
				)}
			</As>
		);
	}
);

Cell.displayName = 'Item';
