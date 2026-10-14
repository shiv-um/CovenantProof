import os
import torch
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, TaskType
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from trl import SFTTrainer


def run_lora_finetuning(
        dataset_path: str = "synthetic_data/output/dpo_dataset.jsonl",
        model_id: str = "Qwen/Qwen2.5-1.5B-Instruct",  # Lightweight, highly capable model for Mac local training
        output_dir: str = "models/covenant-auditor-lora",
):
    print(f"Loading generated traces from {dataset_path}...")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found. Run the audit harness first to generate traces.")

    # 1. Load the dataset generated in Phase 5
    dataset = load_dataset("json", data_files=dataset_path, split="train")

    # 2. Initialize Tokenizer and Model (targeting Apple MPS if available, else CPU)
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"Initializing {model_id} on device: {device.upper()}")

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if device == "mps" else torch.float32,
        device_map=device,
    )

    # 3. Configure Parameter-Efficient Fine-Tuning (LoRA)
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=8,  # Rank of the update matrices
        lora_alpha=16,  # LoRA scaling factor
        lora_dropout=0.05,
        target_modules=["q_proj", "v_proj"],  # Target attention blocks
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 4. Define Training Arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=1,
        save_strategy="epoch",
        optim="adamw_torch",
        report_to="none",  # Set to "wandb" if you want to track loss curves later
        use_mps_device=(device == "mps"),
    )

    # 5. Format Prompts for the SFT Trainer
    def formatting_func(example):
        """Converts the JSONL messages array into a single training string."""
        sys_msg = example.get("system", "")
        user_msg = next((m["content"] for m in example["messages"] if m["role"] == "user"), "")
        asst_msg = next((m["content"] for m in example["messages"] if m["role"] == "assistant"), "")

        # Standard ChatML format
        text = f"<|im_start|>system\n{sys_msg}<|im_end|>\n<|im_start|>user\n{user_msg}<|im_end|>\n<|im_start|>assistant\n{asst_msg}<|im_end|>"
        return [text]

    # 6. Execute Training Loop
    print("\nStarting LoRA Supervised Fine-Tuning...")
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        args=training_args,
        tokenizer=tokenizer,
        formatting_func=formatting_func,
        max_seq_length=1024,
    )

    trainer.train()

    # 7. Save the Fine-Tuned Adapter Weights
    print(f"\nTraining complete. Saving adapter weights to {output_dir}")
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)


if __name__ == "__main__":
    run_lora_finetuning()
