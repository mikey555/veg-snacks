import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import config from "../config";
import Form from "react-bootstrap/Form";
import { ProductType } from "../types/note";
import Stack from "react-bootstrap/Stack";
import LoaderButton from "../components/LoaderButton";
import "./Notes.css";
import { s3Upload } from "../lib/awsLib";

export default function Notes() {
    const file = useRef<null | File>(null)
    const { id } = useParams();
    const nav = useNavigate();
    const [product, setProduct] = useState<null | ProductType>(null);
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        function loadProduct() {
            return API.get("veg-snacks", `/products/${id}`, {});
        }

        async function onLoad() {
            try {
                const product = await loadProduct();
                const { name, brand, category, attachment } = product;

                if (attachment) {
                    product.attachmentURL = await Storage.vault.get(attachment);
                }

                setName(name);
                setBrand(brand);
                setCategory(category);
                setProduct(product);
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [id]);

    function validateForm() {
        return name.length > 0;
    }

    function formatFilename(str: string) {
        return str.replace(/^\w+-/, "");
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.currentTarget.files === null) return;
        file.current = event.currentTarget.files[0];
    }

    function saveProduct(product: ProductType) {
        return API.put("veg-snacks", `/products/${id}`, {
            body: product,
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        let attachment;

        event.preventDefault();

        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000
                } MB.`
            );
            return;
        }

        setIsLoading(true);

        try {
            if (file.current) {
                attachment = await s3Upload(file.current);
            } else if (product && product.attachment) {
                attachment = product.attachment;
            }

            await saveProduct({
                name: name,
                brand: brand,
                category: category,
                attachment: attachment,
            });
            nav("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function deleteNote() {
        return API.del("veg-snacks", `/products/${id}`, {});
    }

    async function handleDelete(event: React.FormEvent<HTMLModElement>) {
        event.preventDefault();

        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteNote();
            nav("/");
        } catch (e) {
            onError(e);
            setIsDeleting(false);
        }
    }

    function renderViewProduct(product: ProductType) {
        return (<Stack gap={3}>
            <div>{product.name}</div>
            <div>{product.brand}</div>
            <div>{product.category}</div>
        </Stack>);
    }

    function renderEditProduct(product: ProductType) {
        return <Form onSubmit={handleSubmit}>
            <Stack gap={3}>
                <Form.Group controlId="content">
                    <Form.Control
                        size="lg"
                        as="textarea"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mt-2" controlId="file">
                    <Form.Label>Attachment</Form.Label>
                    {product.attachment && (
                        <p>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={product.attachmentURL}
                            >
                                {formatFilename(product.attachment)}
                            </a>
                        </p>
                    )}
                    <Form.Control onChange={handleFileChange} type="file" />
                </Form.Group>
                <Stack gap={1}>
                    <LoaderButton
                        size="lg"
                        type="submit"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                    >
                        Save
                    </LoaderButton>
                    <LoaderButton
                        size="lg"
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                    >
                        Delete
                    </LoaderButton>
                </Stack>
            </Stack>
        </Form>
    }

    return (
        <div className="Notes">
            {(product && isAdmin) ?
                renderEditProduct(product) :
                product && renderViewProduct(product)}
        </div>
    );
}