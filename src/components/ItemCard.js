import React from 'react';

export function ItemCard({ item, isFavourite, onToggleFavourite }) {
	return (
		<div className="item-card" role="listitem" aria-label={`Item ${item.name}`}>
			<div className="item-card__header">
				<h3 className="item-card__title">{item.name}</h3>
				<button
					className={"fav-btn" + (isFavourite ? " fav-btn--active" : "")}
					aria-pressed={isFavourite}
					title={isFavourite ? "Remove from favourites" : "Add to favourites"}
					onClick={() => onToggleFavourite(item.id)}
				>
					{isFavourite ? "★" : "☆"}
				</button>
			</div>
			<div className="item-card__meta">
				<span className="badge" aria-label="Category">{item.category}</span>
				<span className="price" aria-label="Price">${item.price.toFixed(2)}</span>
				<span className="rating" aria-label="Rating">{item.rating.toFixed(1)}★</span>
			</div>
		</div>
	);
}


