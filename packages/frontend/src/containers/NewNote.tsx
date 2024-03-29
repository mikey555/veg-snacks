import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./NewNote.css";
import { API } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { ProductType } from "../types/note";
import { s3Upload } from "../lib/awsLib";

export default function NewNote() {
    const file = useRef<null | File>(null);
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        return name.length > 0 && brand.length > 0;
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.currentTarget.files === null) return
        file.current = event.currentTarget.files[0];
    }

    function createProduct(product: ProductType) {
        return API.post("veg-snacks", "/products", {
            body: product,
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
            const attachment = file.current
                ? await s3Upload(file.current)
                : undefined;

            await createProduct({
                name, brand, category, attachment
            });
            nav("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    return (
        <div className="NewNote">
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="brand">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="category">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mt-2" controlId="file">
                    <Form.Label>Attachment</Form.Label>
                    <Form.Control onChange={handleFileChange} type="file" />
                </Form.Group>
                <LoaderButton
                    size="lg"
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                >
                    Create
                </LoaderButton>
            </Form>
        </div>
    );
}
